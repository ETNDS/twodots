"use client";

import styles from "@styles/dialog.module.css";

type Props = {
  titolo: string;
  testo: string;
  confermaTesto?: string;
  annullaTesto?: string;
  onConferma: () => void;
  onAnnulla?: () => void;
};

export default function Dialog({
  titolo,
  testo,
  confermaTesto = "Ok",
  annullaTesto,
  onConferma,
  onAnnulla,
}: Props) {
  return (
    <div className={styles.overlay} onClick={onAnnulla}>
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.titolo}>{titolo}</h3>
        <p className={styles.testo}>{testo}</p>
        <div className={styles.azioni}>
          {annullaTesto && onAnnulla && (
            <button className={styles.btnAnnulla} onClick={onAnnulla}>
              {annullaTesto}
            </button>
          )}
          <button className={styles.btnConferma} onClick={onConferma}>
            {confermaTesto}
          </button>
        </div>
      </div>
    </div>
  );
}
