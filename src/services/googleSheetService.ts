
import { Evaluation, SalesPerson, Task, User } from '../types';


const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxkDMHALiN7ZvbDPm2UtddvC-8llq6r-f6QnXKT4QbySFL4VbDWLwzGKfpj9nDHyM0/exec";

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
        throw new Error(`HTTP error! status: ${response.status}`);
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
    if (!GOOGLE_SCRIPT_URL) return true;

    try {
      // Use no-cors to avoid CORS issues since Apps Script text/plain response is opaque
      await fetch(`${GOOGLE_SCRIPT_URL}?action=saveEvaluation`, {
        method: 'POST',
        body: JSON.stringify({ ...evaluation, scores: evaluation.scores }),
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      return true;
    } catch (error) {
      console.error("Failed to save evaluation", error);
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
          'Content-Type': 'text/plain'
        }
      });
      return true;
    } catch (error) {
      console.error("Failed to save task", error);
      return false;
    }
  }
};
