"use client"; 
import { useEffect, useState } from "react";
import NonAuth from "./layouts/nonAuth";
import AdminAuth from "./layouts/adminAuth"; 
import HeroSection from "@/components/landingPage/heroSection";
import UspSection from "@/components/landingPage/uspSection";
import CoinSection from "@/components/landingPage/coinSection";
import CtaSection from "@/components/landingPage/ctaSection";
import FaqSection from "@/components/landingPage/faqSection";
import CertificateSection from "@/components/landingPage/clientSection";
import { roleId, sessionId } from "@/lib/getSession";

const HomeRoute = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!sessionId && !!roleId);
  }, []);

  if (isLoggedIn) {
    return (
      <AdminAuth>
        <HeroSection />
        <CertificateSection />
        <UspSection />
        <CoinSection />
        <CtaSection />
        <FaqSection />
      </AdminAuth>
    );
  }

  return (
    <NonAuth>
      <HeroSection />
      <CertificateSection />
      <UspSection />
      <CoinSection />
      <CtaSection />
      <FaqSection />
    </NonAuth>
  );
};

export default HomeRoute;
