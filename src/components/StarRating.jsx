import React from "react";

/**
 * StarRating Bileşeni
 * @param {number} rating - Mevcut puan (0-5 arası)
 * @param {function} onRatingChange - Puan değiştiğinde tetiklenecek fonksiyon (Opsiyonel)
 * @param {boolean} readonly - Sadece görüntüleme modu mu?
 * @param {number} size - Yıldız boyutu (px)
 */
const StarRating = ({ rating = 0, onRatingChange, readonly = true, size = 20 }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {stars.map((star) => {
        const isFull = star <= Math.floor(rating);
        const isHalf = !isFull && star === Math.ceil(rating) && rating % 1 !== 0;

        return (
          <span
            key={star}
            onClick={() => !readonly && onRatingChange && onRatingChange(star)}
            style={{
              cursor: readonly ? "default" : "pointer",
              fontSize: `${size}px`,
              color: isFull || isHalf ? "#FFD700" : "#ccc",
              position: "relative",
              display: "inline-block",
            }}
          >
            {isFull ? "★" : isHalf ? "★" : "☆"}
            {/* Yarım yıldız efekti için basit bir overlay (isteğe bağlı geliştirilebilir) */}
            {isHalf && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "50%",
                  overflow: "hidden",
                  color: "#FFD700",
                }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
      {readonly && rating > 0 && (
        <span style={{ marginLeft: "5px", fontSize: "0.9rem", color: "#666", fontWeight: "bold" }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
