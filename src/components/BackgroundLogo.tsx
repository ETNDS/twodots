import styles from "@styles/backgroundLogo.module.css";

export default function BackgroundLogo() {
  return (
    <>
      <div className={styles.left}>
        <img src="/images/twodots-logo-left.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "right center" }} />
      </div>
      <div className={styles.right}>
        <img src="/images/twodots-logo-right.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left center" }} />
      </div>
    </>
  );
}
