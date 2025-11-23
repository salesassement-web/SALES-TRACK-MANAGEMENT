import re

# Read the original file
with open('src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Step 1: Update imports
content = content.replace(
    "import { ScoreData } from '../types';",
    "import { ScoreData, TaskStatus } from '../types';"
)

content = content.replace(
    "import { PrintSettings } from '../components/PrintSettings';",
    "import { PrintSettings } from '../components/PrintSettings';\nimport { CircularProgress } from '../components/CircularProgress';"
)

# Step 2: Add tasks to useApp destructuring
content = content.replace(
    "const { salesList, evaluations, usersList, principles, currentUser, kpiConfig, appConfig } = useApp();",
    "const { salesList, evaluations, usersList, principles, currentUser, kpiConfig, appConfig, tasks } = useApp();"
)

# Step 3: Add task statistics after fullyRated calculation
old_stats = """  const currentMonthEvals = dashboardEvaluations.filter(e => e.month === currentMonth && e.year === currentYear);
  const fullyRated = currentMonthEvals.filter(e => e.supervisorRated && e.kasirRated && e.hrdRated).length;
  """

new_stats = """  const currentMonthEvals = dashboardEvaluations.filter(e => e.month === currentMonth && e.year === currentYear);
  const fullyRated = currentMonthEvals.filter(e => e.supervisorRated && e.kasirRated && e.hrdRated).length;
  
  // Task Statistics (for all supervisors if manager, only my tasks if supervisor)
  const dashboardTasks = isSupervisor ? tasks.filter(t => t.supervisorId === currentUser?.id) : tasks;
  const totalTasks = dashboardTasks.length;
  const completedTasks = dashboardTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const pendingTasks = dashboardTasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.ONGOING).length;
  const taskProgressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  """

content = content.replace(old_stats, new_stats)

# Step 4: Add circular progress cards after Section 1
old_section = """          </div>

          {/* SECTION 2: PRINCIPLE PROGRESS */}"""

new_section = """          </div>

          {/* SECTION 1.5: CIRCULAR PROGRESS CARDS */}
          <div className="print-section">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Task Progress Circular Card */}
                  <CircularProgress
                      title="Task Progress"
                      percentage={taskProgressPercentage}
                      total={totalTasks}
                      completed={completedTasks}
                      pending={pendingTasks}
                  />
                  {/* Evaluation Progress Circular Card */}
                  <CircularProgress
                      title="Evaluation Progress"
                      percentage={Math.round((fullyRated / totalSales) * 100) || 0}
                      total={totalSales}
                      completed={fullyRated}
                      pending={totalSales - fullyRated}
                  />
              </div>
          </div>

          {/* SECTION 2: PRINCIPLE PROGRESS */}"""

content = content.replace(old_section, new_section)

# Write the modified content
with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Successfully added circular progress cards to Dashboard.tsx!")
