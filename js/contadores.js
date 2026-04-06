import { db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

export async function contarHistorias() {
  if (!db) return 0;
  try {
    const q = query(collection(db, "historias"), where("aprobado", "==", true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (e) {
    console.log("Error counting stories:", e);
    return 0;
  }
}

export function crearContadorVisitas() {
  // Placeholder for visit counter
  return () => {};
}
