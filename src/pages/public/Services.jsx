import React from "react";
import "../../css/services.css";
import { 
  FaBook, 
  FaGavel, 
  FaStethoscope, 
  FaCode, 
  FaFileSignature, 
  FaIndustry 
} from "react-icons/fa";

const Services = () => {
  const servicesList = [
    {
      icon: <FaBook />,
      title: "Akademik Çeviri",
      description: "Makale, tez, bildiri ve akademik yayınlarınız için uzman akademik kadromuzla terminolojiye sadık çeviriler sunuyoruz.",
      features: ["Terminoloji Kontrolü", "Native Speaker Redaksiyon", "Yayın Formatına Uygunluk"]
    },
    {
      icon: <FaGavel />,
      title: "Hukuki Çeviri",
      description: "Sözleşmeler, mahkeme kararları ve hukuki belgeleriniz için gizlilik esasına dayalı, profesyonel hukuk çevirisi sağlıyoruz.",
      features: ["Gizlilik Sözleşmesi", "Resmi İşlemlerde Geçerlilik", "Uzman Hukukçu Denetimi"]
    },
    {
      icon: <FaStethoscope />,
      title: "Tıbbi & Medikal Çeviri",
      description: "Epikriz raporları, klinik araştırmalar ve ilaç prospektüsleri için tıp doktorları ve uzman çevirmenlerimizle hizmetinizdeyiz.",
      features: ["Tıp Terminolojisi", "Hassas Çeviri Süreci", "Klinik Uyumluluk"]
    },
    {
      icon: <FaCode />,
      title: "Yerelleştirme (Localization)",
      description: "Yazılım, oyun ve web sitelerinizi hedef pazarın kültürel ve dilsel yapısına göre sadece çevirmekle kalmıyor, yerelleştiriyoruz.",
      features: ["Kültürel Uyarlama", "UI/UX Testleri", "SEO Odaklı Çeviri"]
    },
    {
      icon: <FaFileSignature />,
      title: "Yeminli Tercüme",
      description: "Resmi makamlara sunulacak her türlü belgeniz için yeminli tercümanlarımız tarafından imzalı ve kaşeli çeviri hizmeti.",
      features: ["Noter Onay Desteği", "Resmi Belge Teslimi", "Hızlı Teslimat"]
    },
    {
      icon: <FaIndustry />,
      title: "Teknik & Endüstriyel",
      description: "Kullanım kılavuzları, teknik şartnameler ve endüstriyel kataloglar için mühendis kökenli çevirmen kadromuzla yanınızdayız.",
      features: ["Teknik Çizim Desteği", "Sektörel Uzmanlık", "Katalog Tasarım Uyumu"]
    }
  ];

  return (
    <div className="services-page">
      <section className="services-hero">
        <h1>Uzmanlık Alanlarımız</h1>
        <p>
          MiftahTEA olarak, 50'den fazla dilde ve onlarca farklı sektörde 
          profesyonel çözümler üreterek küresel başarınıza ortak oluyoruz.
        </p>
      </section>

      <section className="services-container">
        {servicesList.map((service, index) => (
          <div key={index} className="service-card">
            <div className="service-icon-wrapper">
              {service.icon}
            </div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <ul className="service-features">
              {service.features.map((feature, fIndex) => (
                <li key={fIndex}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Services;
