"use client";

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import QALab from '../components/QALab';
import Experience from '../components/Experience';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function ClientHome({ 
  profileData, 
  skillsData, 
  expData, 
  projectsData 
}) {
  const [systemStatus, setSystemStatus] = useState("System Normal");
  const [statusClass, setStatusClass] = useState("");

  return (
    <>
      <Navbar profileData={profileData} />
      <main>
        <Hero
          systemStatus={systemStatus}
          statusClass={statusClass}
          setSystemStatus={setSystemStatus}
          setStatusClass={setStatusClass}
          profileData={profileData}
        />
        <About profileData={profileData} />
        <Projects projectsData={projectsData} />
        <Skills skillsData={skillsData} />
        <QALab
          setSystemStatus={setSystemStatus}
          setStatusClass={setStatusClass}
        />
        <Experience experienceData={expData} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
