import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Pill, Stethoscope, User, Bed, DoorOpen, Users, Briefcase, Coffee, AlertCircle } from 'lucide-react';

const NeurologyRPGGame = () => {
  // Character selection state
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [genderIndex, setGenderIndex] = useState(0);
  const [skinToneIndex, setSkinToneIndex] = useState(0);

  // Game state
  const [playerPos, setPlayerPos] = useState({ x: 2, y: 2 });
  const [inventory, setInventory] = useState([]);
  const [collectedItems, setCollectedItems] = useState({});
  const [currentRoom, setCurrentRoom] = useState('hospital');
  const [patientHealed, setPatientHealed] = useState(false);
  const [gameProgress, setGameProgress] = useState({
    patientHealed: false,
    nurseGreeted: false,
    hasMedicine: false,
    hasApple: false,
    tasksCompleted: 0,
    gameComplete: false
  });
  
  // Dialog states
  const [activeDialog, setActiveDialog] = useState(null);
  const [dialogHistory, setDialogHistory] = useState([]);

  // Character selection logic
  const genders = [
    { type: 'person', label: '' },
    { type: 'man', label: '' },
    { type: 'woman', label: '' }
  ];

  const skinTones = [
    { modifier: '', label: '' },
    { modifier: '🏻', label: '' },
    { modifier: '🏼', label: '' },
    { modifier: '🏽', label: '' },
    { modifier: '🏾', label: '' },
    { modifier: '🏿', label: '' }
  ];

  const getEmoji = () => {
    const gender = genders[genderIndex].type;
    const skinTone = skinTones[skinToneIndex].modifier;
    
    switch (gender) {
      case 'man':
        return `👨${skinTone}‍⚕️`;
      case 'woman':
        return `👩${skinTone}‍⚕️`;
      default:
        return `🧑${skinTone}‍⚕️`;
    }
  };

  const nextGender = () => {
    setGenderIndex((prev) => (prev + 1) % genders.length);
  };

  const prevGender = () => {
    setGenderIndex((prev) => (prev - 1 + genders.length) % genders.length);
  };

  const nextSkinTone = () => {
    setSkinToneIndex((prev) => (prev + 1) % skinTones.length);
  };

  const prevSkinTone = () => {
    setSkinToneIndex((prev) => (prev - 1 + skinTones.length) % skinTones.length);
  };

  const startGame = () => {
    setSelectedCharacter(getEmoji());
    setGameStarted(true);
  };

  // Constants
  const GRID_SIZE = 5;
  const ROOMS = {
    hospital: {
      name: 'Neurology Ward',
      description: 'The specialized brain treatment center',
      bgGradient: 'from-purple-50 to-purple-100'
    },
    hallway: {
      name: 'Hospital Hallway',
      description: 'A busy corridor connecting different areas',
      bgGradient: 'from-gray-50 to-gray-100'
    },
    pharmacy: {
      name: 'Neurological Pharmacy',
      description: 'Specialized brain medication storage',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    cafeteria: {
      name: 'Medical Cafeteria',
      description: 'A place to rest and eat',
      bgGradient: 'from-orange-50 to-orange-100'
    }
  };

  // Room layouts
  const roomLayouts = {
    hospital: {
      '1,1': { type: 'npc', id: 'nurse', icon: '👩‍⚕️', name: 'Nurse Sarah', interactive: true },
      '3,3': { type: 'npc', id: 'patient', icon: patientHealed ? '😊' : '🤒', name: patientHealed ? 'Patient John (Recovered)' : 'Patient John (Sick)', interactive: true },
      '4,1': { type: 'item', id: 'medicine', icon: '💊', name: 'Neurological Medicine', collectible: true },
      '0,0': { type: 'item', id: 'stethoscope', icon: '🩺', name: 'Stethoscope', collectible: true },
      '4,2': { type: 'door', target: 'hallway', icon: '🚪', name: 'Exit to Hallway' },
      '2,4': { type: 'furniture', icon: '🛏️', name: 'Patient Bed', solid: true },
      '0,4': { type: 'furniture', icon: '📋', name: 'Brain Scan Chart', solid: true },
      '4,4': { type: 'furniture', icon: '🧠', name: 'Brain Imaging Equipment', solid: true }
    },
    hallway: {
      '0,2': { type: 'door', target: 'hospital', icon: '🚪', name: 'Neurology Ward' },
      '4,2': { type: 'door', target: 'pharmacy', icon: '🚪', name: 'Pharmacy' },
      '2,0': { type: 'door', target: 'cafeteria', icon: '🚪', name: 'Cafeteria' },
      '1,1': { type: 'npc', id: 'receptionist', icon: '👨‍💼', name: 'Receptionist Mike', interactive: true },
      '3,3': { type: 'furniture', icon: '🪑', name: 'Waiting Chair', solid: false },
      '1,3': { type: 'furniture', icon: '🪑', name: 'Waiting Chair', solid: false },
      '3,1': { type: 'decoration', icon: '🧠', name: 'Brain Anatomy Poster' },
      '0,0': { type: 'decoration', icon: '🌱', name: 'Plant' },
      '4,4': { type: 'decoration', icon: '🌱', name: 'Plant' },
      '2,4': { type: 'furniture', icon: '🗄️', name: 'Medical Records', solid: true }
    },
    pharmacy: {
      '0,2': { type: 'door', target: 'hallway', icon: '🚪', name: 'Back to Hallway' },
      '2,2': { type: 'npc', id: 'pharmacist', icon: '👨‍⚕️', name: 'Neurologist Dr. Smith', interactive: true },
      '1,1': { type: 'item', id: 'bandages', icon: '🩹', name: 'Brain Monitoring Patches', collectible: true },
      '3,1': { type: 'item', id: 'vitamins', icon: '💊', name: 'Brain Vitamins', collectible: true },
      '1,3': { type: 'furniture', icon: '🗄️', name: 'Neuromedicine Cabinet', solid: true },
      '3,3': { type: 'furniture', icon: '🗄️', name: 'Research Cabinet', solid: true },
      '4,0': { type: 'decoration', icon: '🧪', name: 'Brain Research Lab' },
      '4,4': { type: 'decoration', icon: '📚', name: 'Neurology Textbooks' }
    },
    cafeteria: {
      '2,4': { type: 'door', target: 'hallway', icon: '🚪', name: 'Back to Hallway' },
      '2,2': { type: 'npc', id: 'cafeteria_worker', icon: '👩‍🍳', name: 'Chef Maria', interactive: true },
      '1,1': { type: 'item', id: 'apple', icon: '🍎', name: 'Brain-Healthy Apple', collectible: true },
      '3,1': { type: 'item', id: 'water', icon: '💧', name: 'Hydration for Brain Health', collectible: true },
      '0,0': { type: 'furniture', icon: '🪑', name: 'Dining Chair', solid: false },
      '1,0': { type: 'furniture', icon: '🪑', name: 'Dining Chair', solid: false },
      '3,0': { type: 'furniture', icon: '🪑', name: 'Dining Chair', solid: false },
      '4,0': { type: 'furniture', icon: '🪑', name: 'Dining Chair', solid: false },
      '0,3': { type: 'furniture', icon: '🍽️', name: 'Dining Table', solid: true },
      '4,3': { type: 'furniture', icon: '🍽️', name: 'Dining Table', solid: true }
    }
  };

  // Dialog content
  const dialogs = {
    nurse: {
      initial: {
        title: "👩‍⚕️ Nurse Sarah",
        content: [
          "Welcome to the Neurology Ward! I'm Nurse Sarah.",
          "We have a patient with neurological symptoms who needs specialized treatment.",
          "He'll need both neurological medicine AND a brain-healthy apple to aid recovery.",
          "You can find medicine here and apples in the cafeteria."
        ],
        action: "I'll help with the treatment!"
      },
      afterGreeting: {
        title: "👩‍⚕️ Nurse Sarah",
        content: [
          "Please check on the patient in the neurology bed.",
          gameProgress.patientHealed ? "Excellent work on the neurological treatment!" : 
          `Remember: ${gameProgress.hasMedicine ? '✓' : '✗'} Medicine, ${gameProgress.hasApple ? '✓' : '✗'} Brain-healthy apple`
        ],
        action: "Understanding!"
      }
    },
    patient: {
      needsMedicine: {
        title: "🤒 Patient John",
        content: [
          "I've been having neurological symptoms...",
          "The neurologist said I need both specialized brain medication AND a nutritious apple for recovery.",
          (() => {
            const hasMedicine = inventory.some(item => item.id === 'medicine');
            const hasApple = inventory.some(item => item.id === 'apple');
            
            if (hasMedicine && hasApple) {
              return "Perfect! You have both the medicine and apple I need for my brain treatment!";
            } else if (hasMedicine) {
              return "I see you have the medicine, but I also need a brain-healthy apple for nutrition.";
            } else if (hasApple) {
              return "I see you have an apple, but I still need the neurological medicine too.";
            } else {
              return "Could you help me get both the brain treatment medicine and a nutritious apple?";
            }
          })()
        ],
        action: (() => {
          const hasMedicine = inventory.some(item => item.id === 'medicine');
          const hasApple = inventory.some(item => item.id === 'apple');
          
          if (hasMedicine && hasApple) {
            return "Here's your complete treatment!";
          } else {
            return "I'll get everything you need";
          }
        })()
      },
      healed: {
        title: "😊 Patient John",
        content: [
          "Amazing! The medicine and apple combination worked perfectly!",
          "My neurological symptoms are completely gone, and I feel so energized!",
          "The brain-healthy nutrition really made a difference. You're an excellent neurologist!"
        ],
        action: "Great to see your complete recovery!"
      }
    },
    receptionist: {
      initial: {
        title: "👨‍💼 Receptionist Mike",
        content: [
          "Welcome to the Neurology Center!",
          "The specialized pharmacy is to the east, and the cafeteria is to the north.",
          "All our staff are trained in neurological care."
        ],
        action: "Thank you!"
      }
    },
    pharmacist: {
      initial: {
        title: "👨‍⚕️ Dr. Smith",
        content: [
          "Welcome to our neurological pharmacy!",
          "We specialize in brain health medications and neural treatments.",
          "Take what you need for the neurological patients."
        ],
        action: "Thanks, Doctor!"
      }
    },
    cafeteria_worker: {
      initial: {
        title: "👩‍🍳 Chef Maria",
        content: [
          "Welcome to our brain-healthy cafeteria!",
          "Good nutrition is essential for neurological health and brain function.",
          "Help yourself to some brain-boosting refreshments!"
        ],
        action: "Thank you!"
      }
    }
  };

  // Get current room layout
  const getCurrentRoomLayout = () => roomLayouts[currentRoom] || {};

  // Check if position has a solid object
  const isSolidObject = (x, y) => {
    const layout = getCurrentRoomLayout();
    const key = `${x},${y}`;
    const element = layout[key];
    return element && element.solid;
  };

  // Handle player movement
  const movePlayer = useCallback((newX, newY) => {
    if (!gameStarted) return;
    
    // Boundary check
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;
    
    // Check for solid objects
    if (isSolidObject(newX, newY)) return;
    
    const key = `${newX},${newY}`;
    const layout = getCurrentRoomLayout();
    const element = layout[key];
    
    if (element) {
      // Handle door interaction
      if (element.type === 'door' && element.target) {
        setCurrentRoom(element.target);
        // Set spawn position based on which room we're entering
        const spawnPositions = {
          hospital: { x: 3, y: 2 },
          hallway: { x: 2, y: 2 },
          pharmacy: { x: 1, y: 2 },
          cafeteria: { x: 2, y: 3 }
        };
        setPlayerPos(spawnPositions[element.target] || { x: 2, y: 2 });
        return;
      }
      
      // Handle NPC interaction
      if (element.type === 'npc' && element.interactive) {
        handleNPCInteraction(element.id);
        return;
      }
      
      // Handle item collection
      if (element.type === 'item' && element.collectible && !collectedItems[`${currentRoom}-${key}`]) {
        collectItem(element, key);
      }
    }
    
    // Move player
    setPlayerPos({ x: newX, y: newY });
  }, [currentRoom, collectedItems, inventory, gameStarted]);

  // Handle keyboard controls
  useEffect(() => {
    if (!gameStarted) return;
    
    const handleKeyPress = (e) => {
      const { x, y } = playerPos;
      switch(e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          movePlayer(x, y - 1);
          break;
        case 's':
        case 'arrowdown':
          movePlayer(x, y + 1);
          break;
        case 'a':
        case 'arrowleft':
          movePlayer(x - 1, y);
          break;
        case 'd':
        case 'arrowright':
          movePlayer(x + 1, y);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos, movePlayer, gameStarted]);

  // Collect item
  const collectItem = (item, key) => {
    setInventory(prev => [...prev, { ...item, roomKey: `${currentRoom}-${key}` }]);
    setCollectedItems(prev => ({ ...prev, [`${currentRoom}-${key}`]: true }));
    
    // Update game progress
    if (item.id === 'medicine') {
      setGameProgress(prev => ({ ...prev, hasMedicine: true, tasksCompleted: prev.tasksCompleted + 1 }));
    } else if (item.id === 'apple') {
      setGameProgress(prev => ({ ...prev, hasApple: true, tasksCompleted: prev.tasksCompleted + 1 }));
    }
  };

  // Handle NPC interaction
  const handleNPCInteraction = (npcId) => {
    let dialogContent;
    
    switch(npcId) {
      case 'nurse':
        dialogContent = gameProgress.nurseGreeted ? dialogs.nurse.afterGreeting : dialogs.nurse.initial;
        if (!gameProgress.nurseGreeted) {
          setGameProgress(prev => ({ ...prev, nurseGreeted: true }));
        }
        break;
      case 'patient':
        if (gameProgress.patientHealed) {
          dialogContent = dialogs.patient.healed;
        } else {
          const hasMedicine = inventory.some(item => item.id === 'medicine');
          const hasApple = inventory.some(item => item.id === 'apple');
          
          if (hasMedicine && hasApple) {
            // Heal patient - remove both items
            setInventory(prev => prev.filter(item => item.id !== 'medicine' && item.id !== 'apple'));
            setPatientHealed(true);
            setGameProgress(prev => ({ 
              ...prev, 
              patientHealed: true,
              tasksCompleted: prev.tasksCompleted + 1
            }));
            dialogContent = dialogs.patient.healed;
          } else {
            dialogContent = dialogs.patient.needsMedicine;
          }
        }
        break;
      default:
        dialogContent = dialogs[npcId]?.initial || {
          title: "NPC",
          content: ["Hello!"],
          action: "Hi!"
        };
    }
    
    setActiveDialog(dialogContent);
    setDialogHistory(prev => [...prev, { npc: npcId, timestamp: Date.now() }]);
  };

  // Check for game completion
  useEffect(() => {
    if (gameProgress.patientHealed && !gameProgress.gameComplete) {
      setGameProgress(prev => ({ ...prev, gameComplete: true }));
      setTimeout(() => {
        setActiveDialog({
          title: "🎉 Neurological Success!",
          content: [
            "You've successfully treated the neurological patient!",
            "You're a skilled neurologist and brain health expert!",
            "The patient's cognitive function has been restored!"
          ],
          action: "Excellent!"
        });
      }, 1000);
    }
  }, [gameProgress.patientHealed, gameProgress.gameComplete]);

  // Render grid
  const renderGrid = () => {
    const tiles = [];
    const layout = getCurrentRoomLayout();
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const key = `${x},${y}`;
        const element = layout[key];
        const isPlayer = playerPos.x === x && playerPos.y === y;
        const isCollected = collectedItems[`${currentRoom}-${key}`];
        
        tiles.push(
          <div
            key={key}
            className={`
              w-20 h-20 border border-gray-300 flex items-center justify-center relative cursor-pointer
              transition-all duration-200 hover:scale-105 hover:z-10
              ${isPlayer ? 'ring-4 ring-purple-400 bg-purple-50' : 'bg-white'}
              ${element?.type === 'door' ? 'bg-brown-100 hover:bg-brown-200' : ''}
              ${element?.type === 'npc' ? 'bg-blue-50 hover:bg-blue-100' : ''}
              ${element?.type === 'item' && !isCollected ? 'bg-green-50 hover:bg-green-100' : ''}
              ${element?.solid ? 'bg-gray-100 cursor-not-allowed' : ''}
            `}
            onClick={() => movePlayer(x, y)}
            title={element?.name || `Floor (${x}, ${y})`}
          >
            {element && !isCollected && (
              <span className="text-6xl">{element.icon}</span>
            )}
            {isPlayer && (
              <span className="absolute text-6xl z-20">{selectedCharacter}</span>
            )}
          </div>
        );
      }
    }
    
    return tiles;
  };

  // Character selection screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 border-2 border-blue-500/30 shadow-2xl max-w-md w-full">
          
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
              🧠 NEUROLOGY RPG
            </h1>
            <p className="text-gray-300 text-lg">Choose Your Neurologist</p>
          </div>

          {/* Character Display Area */}
          <div className="relative flex items-center justify-center mb-8">
            
            {/* Center Character Container */}
            <div className="relative flex flex-col items-center space-y-4">
              <div className="relative text-8xl p-4 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-full border-2 border-gray-600">
                {getEmoji()}
                
                {/* Left Arrow - Gender */}
                <button
                  onClick={prevGender}
                  className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 -ml-1 p-2 rounded-full bg-blue-600/50 hover:bg-blue-600 transition-all duration-200 hover:scale-110 text-white text-sm"
                  title="Previous Gender"
                >
                  ←
                </button>

                {/* Right Arrow - Gender */}
                <button
                  onClick={nextGender}
                  className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 ml-1 p-2 rounded-full bg-blue-600/50 hover:bg-blue-600 transition-all duration-200 hover:scale-110 text-white text-sm"
                  title="Next Gender"
                >
                  →
                </button>

                {/* Up Arrow - Lighter Skin Tone */}
                <button
                  onClick={prevSkinTone}
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full -mt-1 p-2 rounded-full bg-purple-600/50 hover:bg-purple-600 transition-all duration-200 hover:scale-110 text-white text-sm"
                  title="Lighter Skin Tone"
                >
                  ↑
                </button>

                {/* Down Arrow - Darker Skin Tone */}
                <button
                  onClick={nextSkinTone}
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-1 p-2 rounded-full bg-purple-600/50 hover:bg-purple-600 transition-all duration-200 hover:scale-110 text-white text-sm"
                  title="Darker Skin Tone"
                >
                  ↓
                </button>
              </div>
              
              {/* Character Info */}
              <div className="text-center">
                {genders[genderIndex].label && (
                  <h3 className="text-xl font-semibold text-cyan-300 mb-1">
                    {genders[genderIndex].label}
                  </h3>
                )}
                {skinTones[skinToneIndex].label && (
                  <p className="text-gray-400 text-sm">
                    {skinTones[skinToneIndex].label}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Controls Info */}
          <div className="text-center mb-6 space-y-2 text-sm text-gray-400">
            <p>← → Change Gender</p>
            <p>↑ ↓ Change Skin Tone</p>
          </div>

          {/* Start Game Button */}
          <div className="text-center">
            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-lg transform transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Start Neurology Adventure
            </button>
          </div>

          {/* Character Stats/Flavor */}
          <div className="mt-8 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <h4 className="text-cyan-300 font-semibold mb-2">🧠 Specialization</h4>
            <p className="text-gray-300 text-sm">
              Expert in neural pathways, brain diagnostics, and cognitive enhancement. 
              Ready to heal minds and restore neural function in your medical adventure!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">🧠 Neurology RPG Adventure</h1>
          <p className="text-gray-600">Help patients with neurological conditions and explore the medical center!</p>
        </div>

        {/* Main Game Area */}
        <div className="flex flex-col items-center">
          {/* Room Info */}
          <div className={`w-full max-w-md bg-gradient-to-r ${ROOMS[currentRoom].bgGradient} p-4 rounded-t-lg border-2 border-gray-300`}>
            <h2 className="text-xl font-bold text-gray-800">{ROOMS[currentRoom].name}</h2>
            <p className="text-sm text-gray-600">{ROOMS[currentRoom].description}</p>
          </div>

          {/* Game Grid */}
          <div className="grid grid-cols-5 gap-1 p-4 bg-gray-800 rounded-b-lg">
            {renderGrid()}
          </div>

          {/* Controls */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Use WASD or Arrow keys to move</p>
            <p className="text-sm text-gray-600">Click on tiles to move and interact</p>
          </div>

          {/* Bottom Panels */}
          <div className="w-full max-w-4xl mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inventory */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Briefcase size={20} /> Medical Kit
              </h3>
              {inventory.length === 0 ? (
                <p className="text-sm text-gray-500">Empty</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {inventory.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Heart size={20} /> Treatment Progress
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={gameProgress.nurseGreeted} readOnly />
                  <span>Consult with Nurse Sarah</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={gameProgress.hasMedicine} readOnly />
                  <span>Find Neurological Medicine</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={gameProgress.hasApple} readOnly />
                  <span>Get Brain-Healthy Apple</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={gameProgress.patientHealed} readOnly />
                  <span>Treat Patient with Both Items</span>
                </div>
              </div>
              {gameProgress.gameComplete && (
                <div className="mt-4 p-2 bg-green-100 rounded text-center">
                  <span className="text-green-700 font-semibold">Treatment Successful! 🎉</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dialog Modal */}
        {activeDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setActiveDialog(null)}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform scale-100 animate-in" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">{activeDialog.title}</h3>
                <div className="space-y-3 mb-6">
                  {activeDialog.content.map((line, idx) => (
                    <p key={idx} className="text-gray-700">{line}</p>
                  ))}
                </div>
                <button
                  onClick={() => setActiveDialog(null)}
                  className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  {activeDialog.action}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-in {
          animation: animate-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NeurologyRPGGame;
