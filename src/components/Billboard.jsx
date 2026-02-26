import React, { useState, useEffect } from "react";
import "../css/Billboard.css"; // CSS dosyasını dahil et

const Billboard = ({ onScrollTo, onRegister }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      type: "image",
      title: "MiftahTEA",
      description:
        "Profesyonel çevirmen ağına katılın veya ihtiyacınız olan uzmanı hemen bulun. Dünyanın her yerinden iş fırsatları ve yetenekler bir arada.",
      buttonText: "Tercümanlık İş İlanları",
      image: "src/assets/translate_background.jpg",
      action: "scroll",
    },
    {
      id: 2,
      title: "Tercüman Başvurusu",
      description:
        "Dil becerilerinizi gelire dönüştürün. MiftahTEA ailesine katılmak için hemen başvuru yapın.",
      buttonText: "Tek Tıklama Tercüman Başvuru Formu Doldurun",
      action: "register",
    },
    {
      id: 3,
      type: "image",
      title: "Hızlı Çeviri",
      description:
        "Belgelerinizi, metinlerinizi anında uzman ellere teslim edin. Hızlı, güvenilir ve kaliteli çeviri hizmeti.",
      buttonText: "Hemen Başla",
      image: "src/assets/translate_background2.jpg",
      action: "scroll",
    },
    {
      id: 4,
      title: "Global Erişim",
      description:
        "Sınırları aşın. İşinizi ve iletişiminizi tüm dünyaya taşıyın. MiftahTEA ile diller engel değil.",
      buttonText: "Keşfet",
      action: "scroll",
    },
  ];

  // Otomatik slayt geçişi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 saniyede bir değiş

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  const handleButtonClick = (action) => {
    if (action === "scroll" && onScrollTo) {
      onScrollTo();
    } else if (action === "register" && onRegister) {
      onRegister();
    }
  };

  return (
    <div className="billboard-container">
      <div className="billboard-overlay"></div>

      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className="billboard-content"
          style={{
            display: index === currentSlide ? "block" : "none",
            animation:
              index === currentSlide ? "fadeIn 0.5s ease-in-out" : "none",
          }}
        >
          <h1 className="billboard-title">{slide.title}</h1>
          <p className="billboard-description">{slide.description}</p>
          <button
            onClick={() => handleButtonClick(slide.action)}
            className="billboard-btn"
            style={
              slide.action === "register"
                ? {
                    background: "#10b981",
                    boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.5)",
                  }
                : {}
            }
          >
            {slide.buttonText}
          </button>
        </div>
      ))}

      <div className="billboard-dots">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`billboard-dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => handleDotClick(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Billboard;
