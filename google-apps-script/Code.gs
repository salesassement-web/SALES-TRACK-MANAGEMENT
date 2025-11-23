/**
 * GOOGLE APPS SCRIPT untuk Sales Management Tracker
 * 
 * CARA SETUP:
 * 1. Buka Google Spreadsheet Anda
 * 2. Klik Extensions > Apps Script
 * 3. Copy paste semua code ini
 * 4. Deploy > New Deployment > Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy URL deployment dan paste ke googleSheetService.ts
 */

// KONFIGURASI NAMA SHEET
const SHEET_NAMES = {
  USERS: 'Users',
  SALES: 'Sales',
  EVALUATIONS: 'Evaluations',
  TASKS: 'Tasks',
  SUPERVISORS: 'supervisors',
  PRINCIPLES: 'Principles'
};

/**
 * HTTP GET Handler - untuk mengambil data
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getData') {
      return getAllData();
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * HTTP POST Handler - untuk menyimpan data
 */
function doPost(e) {
  try {
    const action = e.parameter.action;
    const postData = JSON.parse(e.postData.contents);
    
    if (action === 'saveEvaluation') {
      return saveEvaluation(postData);
    }
    
    if (action === 'saveTask') {
      return saveTask(postData);
    }

    if (action === 'savePrinciple') {
      return savePrinciple(postData);
    }

    if (action === 'deletePrinciple') {
      return deletePrinciple(postData);
    }

    if (action === 'saveUser') {
      return saveUser(postData);
    }

    if (action === 'deleteUser') {
      return deleteUser(postData);
    }

    if (action === 'saveSalesPerson') {
      return saveSalesPerson(postData);
    }

    if (action === 'deleteSalesPerson') {
      return deleteSalesPerson(postData);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET ALL DATA - Mengambil semua data dari sheets
 */
function getAllData() {
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  
  const data = {
    users: readUsers(ss),
    sales: readSales(ss),
    evaluations: readEvaluations(ss),
    tasks: readTasks(ss),
    principles: readPrinciples(ss)
  };
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    data: data
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * READ USERS
 */
function readUsers(ss) {
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.USERS, [
    'id', 'fullName', 'role', 'principle', 'supervisorId', 'joinDate', 'avatar'
  ]);
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // No data rows
  
  const headers = data[0];
  const users = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip empty rows
    
    users.push({
      id: row[0],
      fullName: row[1],
      role: row[2],
      principle: row[3],
      supervisorId: row[4] || undefined,
      joinDate: row[5] || undefined,
      avatar: row[6] || undefined
    });
  }
  
  return users;
}

/**
 * READ SALES
 */
function readSales(ss) {
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.SALES, [
    'id', 'fullName', 'principle', 'supervisorName', 'joinDate', 'avatar'
  ]);
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const sales = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    sales.push({
      id: row[0],
      fullName: row[1],
      principle: row[2],
      supervisorName: row[3],
      joinDate: row[4],
      avatar: row[5]
    });
  }
  
  return sales;
}

/**
 * READ EVALUATIONS
 */
function readEvaluations(ss) {
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.EVALUATIONS, [
    'salesId', 'year', 'month', 
    'sellOut', 'activeOutlet', 'effectiveCall', 'itemPerTrans',
    'akurasiSetoran', 'sisaFaktur', 'overdue', 'updateSetoran',
    'absensi', 'terlambat', 'fingerScan',
    'supervisorRated', 'kasirRated', 'hrdRated', 'finalScore', 'status'
  ]);
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const evaluations = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    evaluations.push({
      salesId: row[0],
      year: parseInt(row[1]),
      month: parseInt(row[2]),
      scores: {
        sellOut: parseFloat(row[3]) || undefined,
        activeOutlet: parseFloat(row[4]) || undefined,
        effectiveCall: parseFloat(row[5]) || undefined,
        itemPerTrans: parseFloat(row[6]) || undefined,
        akurasiSetoran: parseFloat(row[7]) || undefined,
        sisaFaktur: parseFloat(row[8]) || undefined,
        overdue: parseFloat(row[9]) || undefined,
        updateSetoran: parseFloat(row[10]) || undefined,
        absensi: parseFloat(row[11]) || undefined,
        terlambat: parseFloat(row[12]) || undefined,
        fingerScan: parseFloat(row[13]) || undefined
      },
      supervisorRated: row[14] === 'TRUE' || row[14] === true,
      kasirRated: row[15] === 'TRUE' || row[15] === true,
      hrdRated: row[16] === 'TRUE' || row[16] === true,
      finalScore: parseFloat(row[17]),
      status: row[18]
    });
  }
  
  return evaluations;
}

/**
 * READ TASKS
 */
function readTasks(ss) {
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.TASKS, [
    'id', 'supervisorId', 'title', 'description', 'taskDate', 'dueDate',
    'priority', 'status', 'timeIn', 'timeOut', 'attachment', 'approvalStatus'
  ]);
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const tasks = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    tasks.push({
      id: row[0],
      supervisorId: row[1],
      title: row[2],
      description: row[3],
      taskDate: row[4],
      dueDate: row[5],
      priority: row[6],
      status: row[7],
      timeIn: row[8] || undefined,
      timeOut: row[9] || undefined,
      attachment: row[10] || undefined,
      approvalStatus: row[11] || undefined
    });
  }
  
  return tasks;
}

/**
 * READ PRINCIPLES
 */
function readPrinciples(ss) {
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.PRINCIPLES, ['principle']);
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const principles = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      principles.push(data[i][0]);
    }
  }
  
  return principles;
}

/**
 * SAVE EVALUATION - Menyimpan atau update evaluation
 */
function saveEvaluation(evaluation) {
  if (!evaluation) throw new Error("DO NOT RUN THIS DIRECTLY. Run 'testSaveEvaluation' instead.");
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.EVALUATIONS, [
    'salesId', 'year', 'month', 
    'sellOut', 'activeOutlet', 'effectiveCall', 'itemPerTrans',
    'akurasiSetoran', 'sisaFaktur', 'overdue', 'updateSetoran',
    'absensi', 'terlambat', 'fingerScan',
    'supervisorRated', 'kasirRated', 'hrdRated', 'finalScore', 'status'
  ]);
  
  // Cari baris yang cocok berdasarkan salesId, year, month
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === evaluation.salesId && 
        data[i][1] == evaluation.year && 
        data[i][2] == evaluation.month) {
      rowIndex = i + 1; // Sheet row index (1-based)
      break;
    }
  }
  
  const scores = evaluation.scores || {};
  const rowData = [
    evaluation.salesId,
    evaluation.year,
    evaluation.month,
    scores.sellOut || '',
    scores.activeOutlet || '',
    scores.effectiveCall || '',
    scores.itemPerTrans || '',
    scores.akurasiSetoran || '',
    scores.sisaFaktur || '',
    scores.overdue || '',
    scores.updateSetoran || '',
    scores.absensi || '',
    scores.terlambat || '',
    scores.fingerScan || '',
    evaluation.supervisorRated ? 'TRUE' : 'FALSE',
    evaluation.kasirRated ? 'TRUE' : 'FALSE',
    evaluation.hrdRated ? 'TRUE' : 'FALSE',
    evaluation.finalScore,
    evaluation.status
  ];
  
  if (rowIndex > 0) {
    // Update existing row
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    // Append new row
    sheet.appendRow(rowData);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Evaluation saved'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * SAVE TASK - Menyimpan atau update task
 */
function saveTask(task) {
  if (!task) throw new Error("DO NOT RUN THIS DIRECTLY. Run 'testSaveTask' instead.");
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.TASKS, [
    'id', 'supervisorId', 'title', 'description', 'taskDate', 'dueDate',
    'priority', 'status', 'timeIn', 'timeOut', 'attachment', 'approvalStatus'
  ]);
  
  // Cari baris yang cocok berdasarkan id
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === task.id) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const rowData = [
    task.id,
    task.supervisorId,
    task.title,
    task.description,
    task.taskDate,
    task.dueDate,
    task.priority,
    task.status,
    task.timeIn || '',
    task.timeOut || '',
    task.attachment || '',
    task.approvalStatus || ''
  ];
  
  if (rowIndex > 0) {
    // Update existing row
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    // Append new row
    sheet.appendRow(rowData);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Task saved'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * SAVE PRINCIPLE - Menambah principle baru
 */
function savePrinciple(data) {
  if (!data) throw new Error("DO NOT RUN THIS DIRECTLY. Run 'testSavePrinciple' instead.");
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.PRINCIPLES, ['principle']);
  
  // Cek duplicate
  const principles = sheet.getDataRange().getValues();
  for (let i = 1; i < principles.length; i++) {
    if (principles[i][0] === data.principle) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Principle already exists'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  sheet.appendRow([data.principle]);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Principle saved'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * DELETE PRINCIPLE - Menghapus principle
 */
function deletePrinciple(data) {
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.PRINCIPLES, ['principle']);
  
  const principles = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < principles.length; i++) {
    if (principles[i][0] === data.principle) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Principle deleted'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'Principle not found'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * HELPER: Get or Create Sheet
 */
function getOrCreateSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // Set headers
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      // Format header
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#4285f4')
        .setFontColor('#ffffff');
    }
  }
  
  return sheet;
}

/**
 * FUNGSI SETUP AWAL - Jalankan sekali untuk membuat data dummy
 * Cara: klik fungsi ini di menu Apps Script > pilih setupInitialData > Run
 */
function setupInitialData() {
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  
  // Buat semua sheet dengan header
  getOrCreateSheet(ss, SHEET_NAMES.USERS, [
    'id', 'fullName', 'role', 'principle', 'supervisorId', 'joinDate', 'avatar'
  ]);
  
  getOrCreateSheet(ss, SHEET_NAMES.SALES, [
    'id', 'fullName', 'principle', 'supervisorName', 'joinDate', 'avatar'
  ]);
  
  getOrCreateSheet(ss, SHEET_NAMES.EVALUATIONS, [
    'salesId', 'year', 'month', 
    'sellOut', 'activeOutlet', 'effectiveCall', 'itemPerTrans',
    'akurasiSetoran', 'sisaFaktur', 'overdue', 'updateSetoran',
    'absensi', 'terlambat', 'fingerScan',
    'supervisorRated', 'kasirRated', 'hrdRated', 'finalScore', 'status'
  ]);
  
  getOrCreateSheet(ss, SHEET_NAMES.TASKS, [
    'id', 'supervisorId', 'title', 'description', 'taskDate', 'dueDate',
    'priority', 'status', 'timeIn', 'timeOut', 'attachment', 'approvalStatus'
  ]);

  getOrCreateSheet(ss, SHEET_NAMES.SUPERVISORS, [
    'id', 'fullName', 'principle', 'phoneNumber', 'email'
  ]);
  
  const principlesSheet = getOrCreateSheet(ss, SHEET_NAMES.PRINCIPLES, ['principle']);
  
  // Tambahkan principles default
  const principles = [
    'KALBE', 'UNILEVER', 'KENVEU', 'PERFETTI', 
    'DUA KELINCI', 'WALLS', 'BELLFOODS', 'ULI - FS', 
    'ATC FFI', 'FFI', 'GAGA', 'WALLS - BINJAI', 
    'FFI - BINJAI', 'MAKUKU', 'ALL SANCHO', 'ALL PRINCIPLE'
  ];
  
  principles.forEach(p => {
    principlesSheet.appendRow([p]);
  });
  
  Logger.log('Setup complete! All sheets created with headers.');
}

/**
 * SAVE USER - Menyimpan atau update user
 */
function saveUser(user) {
  if (!user) throw new Error("DO NOT RUN THIS DIRECTLY. Run 'testSaveUser' instead.");
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.USERS, [
    'id', 'fullName', 'role', 'principle', 'supervisorId', 'joinDate', 'avatar'
  ]);
  
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === user.id) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const rowData = [
    user.id,
    user.fullName,
    user.role,
    user.principle,
    user.supervisorId || '',
    user.joinDate || '',
    user.avatar || ''
  ];
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'User saved'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * DELETE USER - Menghapus user
 */
function deleteUser(data) {
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.USERS, [
    'id', 'fullName', 'role', 'principle', 'supervisorId', 'joinDate', 'avatar'
  ]);
  
  const dataRows = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < dataRows.length; i++) {
    if (dataRows[i][0] === data.id) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'User deleted'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'User not found'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * SAVE SALES PERSON - Menyimpan atau update sales
 */
function saveSalesPerson(sales) {
  if (!sales) throw new Error("DO NOT RUN THIS DIRECTLY. Run 'testSaveSalesPerson' (if available) or use the App.");
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.SALES, [
    'id', 'fullName', 'principle', 'supervisorName', 'joinDate', 'avatar'
  ]);
  
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === sales.id) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const rowData = [
    sales.id,
    sales.fullName,
    sales.principle,
    sales.supervisorName,
    sales.joinDate || '',
    sales.avatar || ''
  ];
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Sales Person saved'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * DELETE SALES PERSON - Menghapus sales
 */
function deleteSalesPerson(data) {
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.SALES, [
    'id', 'fullName', 'principle', 'supervisorName', 'joinDate', 'avatar'
  ]);
  
  const dataRows = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < dataRows.length; i++) {
    if (dataRows[i][0] === data.id) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Sales Person deleted'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'Sales Person not found'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * FUNGSI TESTING - Jalankan ini untuk test manual
 */
function testSavePrinciple() {
  const result = savePrinciple({ principle: "TEST_PRINCIPLE_" + new Date().getTime() });
  Logger.log(result.getContent());
}

function testSaveUser() {
  const result = saveUser({
    id: "TEST_USER",
    fullName: "Test User Manual",
    role: "SALES",
    principle: "KALBE"
  });
  Logger.log(result.getContent());
}

function testSaveTask() {
  const result = saveTask({
    id: "TEST_TASK_" + new Date().getTime(),
    supervisorId: "TEST_USER",
    title: "Test Task Manual",
    description: "Created via Apps Script Editor",
    taskDate: "2024-01-01",
    dueDate: "2024-01-02",
    priority: "HIGH",
    status: "PENDING"
  });
  Logger.log(result.getContent());
}

function testReadSales() {
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  const data = readSales(ss);
  Logger.log(JSON.stringify(data, null, 2));
}

function testReadUsers() {
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  const data = readUsers(ss);
  Logger.log(JSON.stringify(data, null, 2));
}

function testReadEvaluations() {
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  const data = readEvaluations(ss);
  Logger.log(JSON.stringify(data, null, 2));
}

function testReadTasks() {
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  const data = readTasks(ss);
  Logger.log(JSON.stringify(data, null, 2));
}

function testReadPrinciples() {
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  const data = readPrinciples(ss);
  Logger.log(JSON.stringify(data, null, 2));
}

/**
 * CLEAR ALL EVALUATIONS - Menghapus semua data evaluasi
 * CARA: Jalankan fungsi ini dari Apps Script Editor untuk menghapus semua evaluasi
 * Menu: Select clearAllEvaluations > Run
 */
function clearAllEvaluations() {
  const ss = SpreadsheetApp.openById('1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko');
  const sheet = ss.getSheetByName(SHEET_NAMES.EVALUATIONS);
  
  if (!sheet) {
    Logger.log('Sheet Evaluations tidak ditemukan.');
    return;
  }
  
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    Logger.log('Tidak ada data evaluasi untuk dihapus (sheet sudah kosong).');
    return;
  }
  
  // Hapus semua baris kecuali header (baris 1)
  sheet.deleteRows(2, lastRow - 1);
  
  Logger.log('✅ BERHASIL! Semua data evaluasi telah dihapus.');
  Logger.log('Total baris yang dihapus: ' + (lastRow - 1));
  Logger.log('Silakan refresh aplikasi untuk melihat perubahan.');
}
