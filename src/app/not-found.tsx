'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function NotFound() {
  // Cores exatas da paleta da plataforma (Modo Dark)
  const bgColor = '#0A1929';
  const paperColor = 'rgba(20, 37, 62, 0.7)'; // Baseado em #14253E com transparência
  const primaryBlue = '#3399FF';
  const primaryLight = '#66B2FF';
  const secondaryOrange = '#FFA726';
  const textPrimary = '#E0E6F1';
  const textSecondary = '#94A3B8';
  const dividerColor = 'rgba(148, 163, 184, 0.2)';

  // Array de elementos caindo (Docentes, Turmas, Horários, etc.)
  // Hardcoded para garantir estabilidade no SSR e evitar erros de hydration.
  const fallingElements = [
    { type: 'teacher', size: 64, xStart: 10, xEnd: 20, delay: 0, duration: 18, rotate: 120, opacity: 0.15 },
    { type: 'class', size: 56, xStart: 30, xEnd: 25, delay: 4, duration: 22, rotate: -90, opacity: 0.15 },
    { type: 'schedule', size: 50, xStart: 75, xEnd: 65, delay: 2, duration: 20, rotate: 180, opacity: 0.1 },
    { type: 'teacher', size: 48, xStart: 85, xEnd: 90, delay: 7, duration: 16, rotate: -45, opacity: 0.2 },
    { type: 'class', size: 60, xStart: 50, xEnd: 45, delay: 12, duration: 25, rotate: 90, opacity: 0.12 },
    { type: 'schedule', size: 40, xStart: 15, xEnd: 5, delay: 9, duration: 19, rotate: -120, opacity: 0.18 },
    { type: 'teacher', size: 70, xStart: 60, xEnd: 70, delay: 1, duration: 24, rotate: 200, opacity: 0.1 },
    { type: 'missing', size: 48, xStart: 45, xEnd: 55, delay: 3, duration: 15, rotate: 180, opacity: 0.25 },
    { type: 'class', size: 55, xStart: 95, xEnd: 85, delay: 5, duration: 21, rotate: 45, opacity: 0.15 },
    { type: 'teacher', size: 45, xStart: 35, xEnd: 40, delay: 10, duration: 17, rotate: -60, opacity: 0.14 },
    { type: 'class', size: 50, xStart: 5, xEnd: 15, delay: 15, duration: 20, rotate: 150, opacity: 0.16 },
    { type: 'schedule', size: 65, xStart: 80, xEnd: 75, delay: 8, duration: 23, rotate: -30, opacity: 0.11 },
  ];

  const getIcon = (type: string, size: number) => {
    switch(type) {
      case 'teacher':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={primaryBlue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'class':
        // Representando uma turma (lousa / apresentação)
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={secondaryOrange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h20" />
            <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
            <path d="M7 21h10" />
            <path d="M12 16v5" />
          </svg>
        );
      case 'schedule':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={textPrimary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'missing':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#F44336" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            <line x1="8" y1="8" x2="16" y2="16" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <html lang="pt-BR">
      <head>
        <title>404 - Página não encontrada</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: ${bgColor};
            color: ${textPrimary};
            overflow: hidden;
          }
          a {
            text-decoration: none;
          }
          * {
            box-sizing: border-box;
          }
        `}</style>
      </head>
      <body>
        <div style={{ 
          position: 'relative', 
          width: '100vw', 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          overflow: 'hidden',
          background: `radial-gradient(circle at 50% 50%, ${bgColor} 0%, #050C14 100%)`
        }}>
          
          {/* Fundo com orbes usando as cores da plataforma */}
          <motion.div
            animate={{
              x: [0, 80, -40, 0],
              y: [0, -80, 40, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              top: '15%',
              left: '25%',
              width: '35vw',
              height: '35vw',
              background: `radial-gradient(circle, ${primaryBlue}2A 0%, rgba(0,0,0,0) 60%)`,
              borderRadius: '50%',
              filter: 'blur(70px)',
              zIndex: 0,
            }}
          />
          <motion.div
            animate={{
              x: [0, -80, 40, 0],
              y: [0, 80, -40, 0],
              scale: [1, 1.15, 0.85, 1],
            }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              bottom: '15%',
              right: '25%',
              width: '40vw',
              height: '40vw',
              background: `radial-gradient(circle, ${secondaryOrange}22 0%, rgba(0,0,0,0) 60%)`,
              borderRadius: '50%',
              filter: 'blur(80px)',
              zIndex: 0,
            }}
          />

          {/* CHUVA DE DOCENTES, TURMAS E HORÁRIOS */}
          {fallingElements.map((el, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: ['-20vh', '120vh'], 
                x: [`${el.xStart}vw`, `${el.xEnd}vw`], 
                rotate: [0, el.rotate] 
              }}
              transition={{ 
                duration: el.duration, 
                repeat: Infinity, 
                delay: el.delay, 
                ease: 'linear' 
              }}
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0,
                zIndex: 1, 
                opacity: el.opacity 
              }}
            >
              {getIcon(el.type, el.size)}
            </motion.div>
          ))}

          {/* Conteúdo Principal / Card de Erro */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
            style={{
              position: 'relative',
              zIndex: 10,
              background: paperColor,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: `1px solid ${dividerColor}`,
              borderRadius: '24px',
              padding: '60px 40px',
              textAlign: 'center',
              maxWidth: '540px',
              width: '90%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <h1 style={{
                fontSize: 'clamp(90px, 15vw, 130px)',
                margin: '0',
                lineHeight: '1',
                fontWeight: '900',
                background: `linear-gradient(135deg, ${primaryLight} 0%, ${primaryBlue} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-4px',
              }}>
                404
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h2 style={{ 
                fontSize: 'clamp(20px, 4vw, 24px)', 
                fontWeight: '600', 
                marginTop: '24px', 
                marginBottom: '16px',
                color: textPrimary,
              }}>
                Atribuição Não Encontrada!
              </h2>
              <p style={{ 
                color: textSecondary, 
                fontSize: '16px', 
                lineHeight: '1.6', 
                marginBottom: '40px',
                maxWidth: '420px',
                margin: '0 auto 40px auto'
              }}>
                Parece que houve um choque de horários! A página que você tentou acessar está com uma restrição severa ou não foi alocada no sistema.
              </p>
              
              <a href="/">
                <motion.button
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: `0 0 20px ${primaryBlue}66` 
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: primaryBlue,
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px 32px',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    margin: '0 auto',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Voltar para o Painel
                </motion.button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
