import { Evaluation, SalesPerson, Task, User } from '../types';


const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxdx0WkHPrGOaHjaJaURU0xPDXHO6YyfTvs61WCRX7Vcz3-sLO8HYZBDgbK39G8PkfO/exec";

export interface AppData {
  users: User[];
  sales: SalesPerson[];
  evaluations: Evaluation[];
  tasks: Task[];
  principles: string[];
}

export const googleSheetService = {
  /**
   * Fetch all data from Google Sheets
   */
  async getAllData(): Promise<AppData | null> {
    if (!GOOGLE_SCRIPT_URL) {
      console.warn("Google Script URL not set.");
      return null;
    }

    try {
      // Append timestamp to avoid browser caching
      console.log("Fetching data from Sheet...");
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getData&t=${Date.now()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} `);
      }

      const json = await response.json();

      if (json.status === 'success') {
        const data = json.data;

        // Normalize scores if they are in decimal format (0-1) -> (0-100)
        const evaluations = (data.evaluations || []).map((e: any) => {
          const normalize = (val: number) => (val <= 1 && val > 0 ? val * 100 : val);

          const scores = e.scores ? {
            sellOut: normalize(e.scores.sellOut),
            activeOutlet: normalize(e.scores.activeOutlet),
            effectiveCall: normalize(e.scores.effectiveCall),
            itemPerTrans: normalize(e.scores.itemPerTrans),
            akurasiSetoran: normalize(e.scores.akurasiSetoran),
            sisaFaktur: normalize(e.scores.sisaFaktur),
            overdue: normalize(e.scores.overdue),
            updateSetoran: normalize(e.scores.updateSetoran),
            absensi: normalize(e.scores.absensi),
            terlambat: normalize(e.scores.terlambat),
            fingerScan: normalize(e.scores.fingerScan),
          } : undefined;

          return {
            ...e,
            scores,
            finalScore: normalize(e.finalScore)
          };
        });

        return {
          users: data.users || [],
          sales: data.sales || [],
          evaluations: evaluations,
          tasks: data.tasks || [],
          principles: data.principles || []
        };
      } else {
        console.error("Google Sheet returned error status:", json);
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch data from Google Sheets", error);
      return null;
    }
  },

  /**
   * Save an Evaluation to Google Sheets
   */
  async saveEvaluation(evaluation: Evaluation): Promise<boolean> {
    try {
      console.log('[saveEvaluation] Attempting to save evaluation:', evaluation);

      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=saveEvaluation`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluation)
      });

      console.log('[saveEvaluation] Response status:', response.status);
      console.log('[saveEvaluation] Evaluation saved successfully');
      return true;
    } catch (error) {
      console.error('[saveEvaluation] Failed to save evaluation:', error);
      console.error('[saveEvaluation] Evaluation data:', evaluation);
      return false;
    }
  },

  /**
   * Save a Task to Google Sheets
   */
  async saveTask(task: Task): Promise<boolean> {
    if (!GOOGLE_SCRIPT_URL) return true;

    try {
      await fetch(`${GOOGLE_SCRIPT_URL}?action=saveTask`, {
        method: 'POST',
        body: JSON.stringify(task),
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return true;
    } catch (error) {
      console.error("Failed to save task", error);
      return false;
    }
  },

  /**
   * Add a Principle to Google Sheets
   */
  async addPrinciple(principle: string): Promise<boolean> {
    if (!GOOGLE_SCRIPT_URL) return true;

    try {
      await fetch(`${GOOGLE_SCRIPT_URL}?action=savePrinciple`, {
        method: 'POST',
        body: JSON.stringify({ principle }),
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return true;
    } catch (error) {
      console.error("Failed to save principle", error);
      return false;
    }
  },

  /**
   * Delete a Principle from Google Sheets
   */
  async deletePrinciple(principle: string): Promise<boolean> {
    if (!GOOGLE_SCRIPT_URL) return true;

    try {
      await fetch(`${GOOGLE_SCRIPT_URL}?action=deletePrinciple`, {
        method: 'POST',
        body: JSON.stringify({ principle }),
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return true;
    } catch (error) {
      console.error("Failed to delete principle", error);
      return false;
    }
  },

  /**
   * Save a User to Google Sheets
   */
  async saveUser(user: User): Promise<boolean> {
    if (!GOOGLE_SCRIPT_URL) return true;

    try {
      await fetch(`${GOOGLE_SCRIPT_URL}?action=saveUser`, {
        method: 'POST',
        body: JSON.stringify(user),
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return true;
    } catch (error) {
      console.error("Failed to save user", error);
      return false;
    }
  },

  /**
   * Delete a User from Google Sheets
   */
  async deleteUser(id: string): Promise<boolean> {
    if (!GOOGLE_SCRIPT_URL) return true;

    try {
      await fetch(`${GOOGLE_SCRIPT_URL}?action=deleteUser`, {
        method: 'POST',
        body: JSON.stringify({ id }),
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      return true;
    } catch (error) {
      console.error("Failed to delete user", error);
      return false;
    }
  },

  /**
   * Save a SalesPerson to Google Sheets
   */
  async saveSalesPerson(sales: SalesPerson): Promise<boolean> {
    if (!GOOGLE_SCRIPT_URL) return true;

    try {
      await fetch(`${GOOGLE_SCRIPT_URL}?action=saveSalesPerson`, {
        method: 'POST',
        body: JSON.stringify(sales),
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      return true;
    } catch (error) {
      console.error("Failed to save sales person", error);
      return false;
    }
  },

  /**
   * Delete a SalesPerson from Google Sheets
   */
  async deleteSalesPerson(id: string): Promise<boolean> {
    if (!GOOGLE_SCRIPT_URL) return true;

    try {
      await fetch(`${GOOGLE_SCRIPT_URL}?action=deleteSalesPerson`, {
        method: 'POST',
        body: JSON.stringify({ id }),
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      return true;
    } catch (error) {
      console.error("Failed to delete sales person", error);
      return false;
    }
  }
};
