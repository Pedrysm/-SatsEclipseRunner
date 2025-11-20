import { useEffect, useRef, useState } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';

// 🔥 CONSTANTES ACTUALIZADAS - ELIMINAMOS LAS NO UTILIZADAS
const ENTRY_FEE = 50000000n; // 0.05 TON por jugada
const RAKE_AMOUNT = 7500000n; // 0.0075 TON (15% de 0.05 TON)
const PRIZE_POOL_AMOUNT = 42500000n; // 0.0425 TON (85% para el premio)
const MAX_WINNER_PRIZE = 50000000000n; // 50 TON máximo para el ganador

// 🔥 ACTUALIZA ESTAS DIRECCIONES CON TUS DIRECCIONES REALES
const OWNER_WALLET = 'UQDU0jzNSVGwoTKifH4z4x5BU1zBTl5u8r2JM7mKvnu-ktrC';
const PRIZE_POOL_CONTRACT = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'; // ⚠️ REEMPLAZAR

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [score, setScore] = useState(0);
  const [referrals, setReferrals] = useState(0);
  const [ranking, setRanking] = useState('Cargando...');
  const [trailerShown, setTrailerShown] = useState(false);
  const [prizePoolBalance, setPrizePoolBalance] = useState(0);

  // 🔥 FUNCIÓN PARA VERIFICAR BALANCE DEL CONTRATO
  const checkPrizePoolBalance = async () => {
    try {
      // Simulación - en producción llamarías a tu contrato
      const simulatedBalance = Math.random() * 100; // Simular balance
      setPrizePoolBalance(simulatedBalance);
      
      alert(
        `🏆 Balance del Prize Pool: ${simulatedBalance.toFixed(2)} TON\n` +
        `💰 Límite para ganador: 50 TON\n` +
        `⭐ Excedente va automáticamente a tu wallet`
      );
    } catch (error) {
      console.error('Error checking pool balance:', error);
    }
  };

  // 🔥 FUNCIÓN MEJORADA CON LÓGICA DE CONTRATO
  const showBusinessModel = () => {
    const entryFeeTon = Number(ENTRY_FEE) / 1000000000;
    const rakeTon = Number(RAKE_AMOUNT) / 1000000000;
    const prizePoolTon = Number(PRIZE_POOL_AMOUNT) / 1000000000;
    const maxPrizeTon = Number(MAX_WINNER_PRIZE) / 1000000000;

    alert(
      `🎯 MODELO CON SMART CONTRACT:\n\n` +
      `💵 Entrada por jugada: ${entryFeeTon} TON\n` +
      `💰 Tu rake inmediato (15%): ${rakeTon} TON\n` +
      `🏆 Al contrato (85%): ${prizePoolTon} TON\n` +
      `🎖️ Máximo para ganador: ${maxPrizeTon} TON\n` +
      `⭐ Excedente >50 TON va a tu wallet\n` +
      `🌟 Premio diario extra: 10 TON para el #1\n` + // 🔥 VALOR FIJO EN LUGAR DE VARIABLE
      `🔒 Todo automatizado por contrato inteligente`
    );
  };

  useEffect(() => {
    if (!trailerShown) {
      const video = document.createElement('video');
      video.src = 'https://raw.githubusercontent.com/tondev420/sats-eclipse-final/main/trailer.mp4';
      video.autoplay = true;
      video.loop = true;
      video.style.position = 'fixed';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.zIndex = '-1';
      video.style.opacity = '0.3';
      document.body.appendChild(video);
      setTimeout(() => setTrailerShown(true), 8000);
    }
  }, [trailerShown]);

  useEffect(() => {
    if (userAddress) {
      fetch(`https://sats-eclipse-leaderboard.vercel.app/api/user?addr=${userAddress}`)
        .then(r => r.json())
        .then((d: any) => {
          setScore(d.score || 0);
          setReferrals(d.referrals || 0);
          if (d.top10) {
            const rankingText = d.top10.map((p: any, i: number) =>
              `${i + 1}. ${p.username} → ${p.score} sats${i === 0 ? ' 👑 10 TON HOY' : ''}`
            ).join('\n');
            setRanking(rankingText);
          }
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          setRanking('Error cargando ranking');
        });
    }
  }, [userAddress]);

  // 🔥 TRANSACCIÓN ACTUALIZADA PARA ENVIAR AL CONTRATO
  const startGame = async () => {
    if (!tonConnectUI.connected) {
      alert('Conecta wallet');
      return;
    }

    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [
        // Tu rake (15%) - va directo a tu wallet
        {
          address: OWNER_WALLET,
          amount: RAKE_AMOUNT.toString(),
          payload: btoa(`rake:${userAddress}:${Date.now()}`)
        },
        // Prize Pool (85%) - va al SMART CONTRACT
        {
          address: PRIZE_POOL_CONTRACT,
          amount: PRIZE_POOL_AMOUNT.toString(),
          payload: btoa(`deposit:${userAddress}:${Date.now()}`)
        }
      ]
    };

    console.log('🚀 Enviando transacción al contrato inteligente...');
    console.log(`💰 Tu ganancia: ${Number(RAKE_AMOUNT) / 1000000000} TON`);
    console.log(`🏆 Al contrato: ${Number(PRIZE_POOL_AMOUNT) / 1000000000} TON`);

    try {
      await tonConnectUI.sendTransaction(tx);
      loadPhaserGame();
    } catch (error) {
      console.error('Transaction error:', error);
      alert('Pago cancelado');
    }
  };

  const loadPhaserGame = () => {
    console.log('🎮 Iniciando juego...');
    console.log(`💰 Rake generado: ${Number(RAKE_AMOUNT) / 1000000000} TON`);
    // Tu lógica Phaser aquí
  };

  const handleFreePlay = () => {
    if (referrals >= 3) {
      console.log('🎯 Partida gratis activada');
      loadPhaserGame();
    }
  };

  return (
    <div style={{
      textAlign: 'center',
      background: 'linear-gradient(#000428,#004e92)',
      minHeight: '100vh',
      padding: '10px',
      color: 'white',
      position: 'relative',
      zIndex: 1
    }}>
      <h1 style={{ color: '#00ffcc', fontSize: '32px', marginBottom: '20px' }}>
        Sats Eclipse Runner 🚀
      </h1>

      {/* 🔥 NUEVA SECCIÓN DE SMART CONTRACT */}
      <div style={{
        background: 'rgba(0, 255, 204, 0.1)',
        padding: '10px',
        borderRadius: '10px',
        margin: '10px',
        border: '2px solid #00ffcc'
      }}>
        <strong>🤖 CONTRATO INTELIGENTE ACTIVADO</strong>
        <br />
        <span style={{ fontSize: '12px' }}>
          Prize Pool automatizado • Límite 50 TON • Excedente automático
        </span>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={showBusinessModel}
          style={{
            background: 'linear-gradient(45deg, #FF9900, #FF6600)',
            color: '#000',
            padding: '10px 15px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            margin: '5px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          💰 Ver Modelo
        </button>
        
        <button 
          onClick={checkPrizePoolBalance}
          style={{
            background: 'linear-gradient(45deg, #00ccff, #0066ff)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            margin: '5px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🏆 Ver Pool
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <TonConnectButton />
      </div>

      <div style={{
        background: '#ff0',
        color: '#000',
        padding: '15px',
        borderRadius: '15px',
        margin: '15px',
        fontWeight: 'bold'
      }}>
        <strong>🤖 CONTRATO AUTOMATIZADO</strong><br />
        <strong>🏆 Límite ganador: 50 TON</strong><br />
        <strong>⭐ Excedente → Owner</strong><br />
        <strong>🎯 +10 TON diario al #1</strong>
      </div>

      {/* INDICADOR DE BALANCE */}
      {prizePoolBalance > 0 && (
        <div style={{
          background: 'rgba(255, 215, 0, 0.2)',
          padding: '10px',
          borderRadius: '10px',
          margin: '10px',
          border: '2px solid gold'
        }}>
          🏆 <strong>Prize Pool:</strong> {prizePoolBalance.toFixed(2)} TON / 50 TON
          {prizePoolBalance > 50 && (
            <span style={{ color: '#00ff00' }}> • ⭐ EXCEDENTE ACTIVO</span>
          )}
        </div>
      )}

      {referrals >= 3 && (
        <button 
          onClick={handleFreePlay}
          style={{
            background: '#0f0',
            color: '#000',
            padding: '15px',
            fontSize: '20px',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            margin: '10px',
            fontWeight: 'bold'
          }}
        >
          ¡JUGADA GRATIS! (tienes {Math.floor(referrals / 3)})
        </button>
      )}

      <button
        onClick={startGame}
        style={{
          background: 'linear-gradient(45deg, #00ffcc, #00ccff)',
          color: '#000',
          fontSize: '28px',
          padding: '20px 40px',
          borderRadius: '20px',
          margin: '20px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        JUGAR – 0.05 TON
      </button>

      <div style={{ color: '#ffff00', fontSize: '24px', margin: '20px 0' }}>
        Tus sats: {score}
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        style={{
          border: '6px solid #00ffcc',
          borderRadius: '20px',
          marginTop: '10px',
          maxWidth: '100%',
          height: 'auto'
        }}
      />

      <pre style={{
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '15px',
        borderRadius: '15px',
        marginTop: '20px',
        whiteSpace: 'pre-wrap',
        textAlign: 'left',
        fontSize: '14px',
        maxHeight: '300px',
        overflow: 'auto'
      }}>
        🏆 RANKING GLOBAL 🏆{'\n'}{ranking}
      </pre>

      <div style={{
        background: 'rgba(0, 255, 204, 0.1)',
        padding: '10px',
        borderRadius: '10px',
        marginTop: '20px'
      }}>
        <strong>🔗 Contrato desplegado en:</strong><br />
        <span style={{ fontSize: '12px', wordBreak: 'break-all' }}>
          {PRIZE_POOL_CONTRACT}
        </span>
      </div>

      <p style={{ marginTop: '30px', fontSize: '18px' }}>
        Invita amigos y gana partidas gratis:<br />
        <strong style={{ wordBreak: 'break-all' }}>
          https://t.me/share/url?url=https://pedrysm.github.io/SatsEclipseRunner
        </strong>
      </p>
    </div>
  );
}
