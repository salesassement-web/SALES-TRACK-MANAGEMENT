import { User, UserRole, SalesPerson, Evaluation, Task, TaskPriority, TaskStatus, ScoreData } from './types';

const CURRENT_DATE = new Date();
const CURRENT_YEAR = CURRENT_DATE.getFullYear();
const TODAY = new Date().toISOString().split('T')[0];
const TOMORROW = new Date(Date.now() + 86400000).toISOString().split('T')[0];

// 1. Define All Principles (Requested List)
const RAW_PRINCIPLES = [
  'KALBE', 'UNILEVER', 'KENVEU', 'PERFETTI', 
  'DUA KELINCI', 'WALLS', 'BELLFOODS', 'ULI - FS', 
  'ATC FFI', 'FFI', 'GAGA', 'WALLS - BINJAI', 
  'FFI - BINJAI', 'MAKUKU'
];

export const PRINCIPLES = [...RAW_PRINCIPLES, 'ALL SANCHO', 'ALL PRINCIPLE'];

// 2. Containers for Generated Data
const generatedUsers: User[] = [
    { id: 'U_ADMIN', fullName: 'ADMINISTRATOR', role: UserRole.ADMIN, principle: 'ALL SANCHO', avatar: 'https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff' },
    { id: 'U_KASIR', fullName: 'ADMIN KASIR', role: UserRole.KASIR, principle: 'ALL PRINCIPLE', avatar: 'https://ui-avatars.com/api/?name=Kasir&background=10b981&color=fff' },
    { id: 'U_HRD', fullName: 'HRD MANAGER', role: UserRole.HRD, principle: 'ALL PRINCIPLE', avatar: 'https://ui-avatars.com/api/?name=HRD&background=f97316&color=fff' },
];
const generatedSales: SalesPerson[] = [];
const generatedEvaluations: Evaluation[] = [];
const generatedTasks: Task[] = [];

// Helper: Generate ID
const genId = (prefix: string, idx: string | number) => `${prefix}_${idx}`;

// Helper: Get Score based on Status (STAY > 75, LEAVE < 75)
const getScoresForStatus = (status: 'STAY' | 'LEAVE'): ScoreData => {
    const min = status === 'STAY' ? 80 : 45;
    const max = status === 'STAY' ? 98 : 70;
    
    const rnd = () => Math.floor(Math.random() * (max - min + 1)) + min;

    return {
        sellOut: rnd(), activeOutlet: rnd(), effectiveCall: rnd(), itemPerTrans: rnd(),
        akurasiSetoran: rnd(), sisaFaktur: rnd(), overdue: rnd(), updateSetoran: rnd(),
        absensi: rnd(), terlambat: rnd(), fingerScan: rnd()
    };
};

// 3. MAIN GENERATION LOOP
RAW_PRINCIPLES.forEach((principle, pIdx) => {
    // A. Create Supervisor (1 per Principle)
    const spvName = `SPV ${principle}`;
    const spvId = genId('U_SPV', pIdx);
    
    generatedUsers.push({
        id: spvId,
        fullName: spvName,
        role: UserRole.SUPERVISOR,
        principle: principle,
        joinDate: '2023-01-01',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(spvName)}&background=random`
    });

    // B. Create Tasks for Supervisor (To populate My Tasks)
    // Create a mix of Open, Ongoing, Completed tasks
    [1, 2, 3, 4, 5].forEach(tIdx => {
        const status = tIdx === 1 ? TaskStatus.COMPLETED : tIdx === 2 ? TaskStatus.ONGOING : TaskStatus.OPEN;
        generatedTasks.push({
            id: genId('T', `${pIdx}_${tIdx}`),
            supervisorId: spvId,
            title: `Monitoring ${principle} - Area ${tIdx}`,
            description: `Routine check and sales validation for ${principle} in district ${tIdx}. Ensure display compliance.`,
            taskDate: TODAY,
            dueDate: tIdx % 2 === 0 ? TODAY : TOMORROW,
            priority: tIdx % 3 === 0 ? TaskPriority.HIGH : TaskPriority.MEDIUM,
            status: status,
            timeIn: status !== TaskStatus.OPEN ? '08:30' : undefined,
            timeOut: status === TaskStatus.COMPLETED ? '10:30' : undefined,
            attachment: status === TaskStatus.COMPLETED ? 'https://placehold.co/600x400/png' : undefined,
            approvalStatus: status === TaskStatus.COMPLETED ? 'APPROVED' : undefined
        });
    });

    // C. Create 3 Sales Persons (2 STAY, 1 LEAVE)
    for (let sIdx = 1; sIdx <= 3; sIdx++) {
        const isLeave = sIdx === 3; // 3rd sales is set to LEAVE
        const targetStatus = isLeave ? 'LEAVE' : 'STAY';
        
        const salesName = `SALES ${sIdx} ${principle}`;
        const salesId = genId('S', `${pIdx}_${sIdx}`);

        generatedSales.push({
            id: salesId,
            fullName: salesName,
            principle: principle,
            supervisorName: spvName,
            joinDate: '2023-01-15',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(salesName)}&background=random`
        });

        // D. Generate 12 Months of Evaluations
        for (let month = 1; month <= 12; month++) {
            const scores = getScoresForStatus(targetStatus);
            
            // Calculate rough final score to set status correctly in object
            // Default weights: SPV 40%, KASIR 40%, HRD 20%
            const spvAvg = (scores.sellOut! + scores.activeOutlet! + scores.effectiveCall! + scores.itemPerTrans!) / 4;
            const kasirAvg = (scores.akurasiSetoran! + scores.sisaFaktur! + scores.overdue! + scores.updateSetoran!) / 4;
            const hrdAvg = (scores.absensi! + scores.terlambat! + scores.fingerScan!) / 3;
            
            const finalScore = (spvAvg * 0.4) + (kasirAvg * 0.4) + (hrdAvg * 0.2);

            generatedEvaluations.push({
                salesId: salesId,
                year: CURRENT_YEAR,
                month: month,
                scores: scores,
                supervisorRated: true,
                kasirRated: true,
                hrdRated: true,
                finalScore: parseFloat(finalScore.toFixed(2)),
                status: finalScore >= 75 ? 'STAY' : 'LEAVE'
            });
        }
    }
});

export const DUMMY_USERS = generatedUsers;
export const DUMMY_SALES = generatedSales;
export const DUMMY_EVALUATIONS = generatedEvaluations;
export const DUMMY_TASKS = generatedTasks;
