import { MAX_CARACTERES } from "../constants.js";

export default function ContadorCaracteres({ total }) {
  return (
    <small className={`fw-bold ${total > 900 ? "text-warning" : "text-muted"}`}>
      {total}/{MAX_CARACTERES} caracteres
    </small>
  );
}
