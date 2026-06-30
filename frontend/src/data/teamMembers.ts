import { STORAGE_BASE } from "../api";

export type TeamMember = {
  name: string;
  role: string;
  skills: string[];
};

export const TEAM_NAME = "D10-PT19";
export const TEAM_AVATAR = `${STORAGE_BASE}/avatars/user-avatar.jpg`;
export const HIGHTECH_LOGO = `${STORAGE_BASE}/hightech.png`;

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Abdelghani DARI",
    role: "Chef de projet / Développeur",
    skills: ["React", "Laravel", "Coordination"],
  },
  {
    name: "Mohamed AMARHYOUZ",
    role: "Testeur / Développeur Backend",
    skills: ["Tests", "Laravel", "PostgreSQL"],
  },
  {
    name: "El Mehdi HAJJAB",
    role: "Développeur Backend",
    skills: ["Laravel", "PostgreSQL"],
  },
  {
    name: "Zakaria ELHANZOURI",
    role: "Responsable documentation",
    skills: ["Documentation", "UML"],
  },
  {
    name: "Marouane AIT CHELH",
    role: "Développeur Frontend",
    skills: ["React", "UI/UX"],
  },
  {
    name: "Marouane KHARRAZ",
    role: "Développeur Backend",
    skills: ["Laravel", "PostgreSQL"],
  },
  {
    name: "Hicham BENBBA",
    role: "Développeur Frontend",
    skills: ["React", "UI/UX"],
  },
];
