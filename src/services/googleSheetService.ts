
import { Evaluation, SalesPerson, Task, User } from '../types';


const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQVZPfloUVhuPXH9cZo1rJysRjD3u6y5_2KiCpZGwLKnyx4rYJ9031SyCaGIHRZR-T/exec";

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
        return json.data;
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
