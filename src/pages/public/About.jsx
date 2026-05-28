import React from "react";
import "../../css/about.css";
import { FaGlobe, FaShieldAlt, FaRocket, FaUsers } from "react-icons/fa";

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>Sınırları Kaldırıyoruz</h1>
          <p>
            Dünyanın her yerinden uzman çevirmenleri tek bir çatı altında
            toplayarak, dil engellerini teknoloji ve profesyonellik ile
            aşıyoruz.
          </p>
        </div>
      </section>

      {/* Main Content & Glass Card */}
      <section className="about-section">
        <div className="container">
          <div className="glass-card">
            <div className="about-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
                alt="Ekibimiz"
                className="about-img"
              />
            </div>
            <div className="about-text">
              <span className="section-tag">Biz Kimiz?</span>
              <h2>Dilin Gücünü Keşfedin</h2>
              <p>
                MiftahTEA, sadece bir çeviri platformu değil, küresel bir
                iletişim köprüsüdür. Amacımız, müşterilerimize en doğru, hızlı
                ve profesyonel çeviri hizmetini sunarken, çevirmenlerimize de
                emeklerinin karşılığını aldıkları modern bir çalışma ortamı
                sağlamaktır.
              </p>
              <p>
                Binlerce başarılı proje ve mutlu müşteri ile yolumuza devam
                ediyoruz. Karmaşık teknik belgelerden samimi kişisel mesajlara
                kadar her kelimeye aynı özeni gösteriyoruz.
              </p>
            </div>
          </div>

          {/* Values Grid */}
          <div className="values-grid">
            <div className="value-card">
              <span className="icon">
                <FaGlobe />
              </span>
              <h3>Küresel Erişim</h3>
              <p>
                50+ dilde, dünyanın dört bir yanındaki anadili düzeyinde
                uzmanlarla çalışıyoruz.
              </p>
            </div>
            <div className="value-card">
              <span className="icon">
                <FaShieldAlt />
              </span>
              <h3>Güven & Gizlilik</h3>
              <p>
                Verileriniz ve projeleriniz en yüksek güvenlik standartları ve
                gizlilik sözleşmeleri ile korunur.
              </p>
            </div>
            <div className="value-card">
              <span className="icon">
                <FaRocket />
              </span>
              <h3>Hız & Teknoloji</h3>
              <p>
                Yapay zeka destekli altyapımız ile projelerinizi teslim
                sürelerinde rekor kırıyoruz.
              </p>
            </div>
            <div className="value-card">
              <span className="icon">
                <FaUsers />
              </span>
              <h3>Müşteri Odaklılık</h3>
              <p>
                Sizin memnuniyetiniz bizim en büyük referansımızdır. 7/24 destek
                ekibimizle yanınızdayız.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Tamamlanan Proje</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Uzman Çevirmen</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Dil Çifti</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">%90</span>
              <span className="stat-label">Müşteri Memnuniyeti</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
