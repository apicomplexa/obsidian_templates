import "obsidian";
import { DataviewAPI } from "obsidian-dataview";
import { Note, Frontmatter } from "./dataviewArray.interface";

declare global {
  const dv: DataviewApi;
  const input: any;
  const app: import("obsidian").App;
}

export {};
