import { type EvaluationProject } from "@shared/schema";

const STORAGE_KEY = "evaluation_project";

export interface IStorage {
  getProject(): EvaluationProject | null;
  saveProject(project: EvaluationProject): void;
  clearProject(): void;
}

export const storage: IStorage = {
  getProject: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as EvaluationProject;
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
    return null;
  },

  saveProject: (project: EvaluationProject) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },

  clearProject: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }
};
