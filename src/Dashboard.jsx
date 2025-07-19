import React, { useState, useEffect } from "react";
import "./Dashboard.css";

// API Configuration - Replace with your actual API key
// API key is now loaded from environment variables via config.js

const APP_CONFIG = {
  maxTokens: 500,
  temperature: 0.7,
  model: 'gpt-3.5-turbo'
};

const navLinks = [
  { id: 'Dashboard', label: 'Dashboard' },
  { id: 'Study Timer', label: 'Study Timer' },
  { id: 'Note Taker', label: 'Note Taker' },
  { id: 'Study Buddy', label: 'AI Learning Assistant' },
  { id: 'AI Summarizer', label: 'AI Summarizer' },
  { id: 'Take a Break', label: 'Take a Break' },
  { id: 'Inclusive Learning Design', label: 'Inclusive Learning Design' },
];

// Dynamic stat cards - will be updated in the component
const getStatCards = (notes, completedSessions, onNotesClick, onTimerClick, onCheckInClick) => [
  {
    label: "Notes Created",
    value: notes.length,
    icon: "📝",
    link: "#",
    onClick: onNotesClick,
  },
  {
    label: "Focus Sessions",
    value: completedSessions,
    icon: "⏱️",
    link: "#",
    onClick: onTimerClick,
  },
  {
    label: "Start Check-in",
    value: "New",
    icon: "✅",
    link: "#",
    onClick: onCheckInClick,
    isButton: true,
  },
];

const overwhelmLevels = [
  { level: 1, emoji: "😊", label: "Calm", message: "You're doing great!" },
  { level: 2, emoji: "🙂", label: "Okay", message: "Take a moment to breathe." },
  { level: 3, emoji: "😐", label: "Stressed", message: "Time for a short break." },
  { level: 4, emoji: "😰", label: "Overwhelmed", message: "Let's take a longer break." },
  { level: 5, emoji: "😵", label: "Very Overwhelmed", message: "Step away and breathe deeply." },
];

const conversationStarters = [
  "Hi! How are you doing today?",
  "I'd like to work on this together.",
  "Can you help me understand this?",
  "I need a moment to think about that.",
  "That's interesting! Tell me more.",
];

const reassuringMessages = [
  "You're doing amazing work. Take this time to recharge.",
  "It's okay to pause. Your brain needs rest to work better.",
  "You've accomplished so much today. Be proud of yourself.",
  "This break will help you come back stronger and more focused.",
  "Remember: progress, not perfection. You're on the right track.",
  "Your well-being matters. This time is just as important as work.",
  "You deserve this moment of peace. Let your mind wander freely.",
  "Every great achievement includes moments of rest. This is part of your success.",
  "You're building healthy habits. Taking breaks is a sign of wisdom.",
  "Trust the process. This pause will make your next session even better."
];

const Dashboard = ({ email }) => {
  const username = email ? email.split('@')[0] : '';
  const [activeTab, setActiveTab] = useState('Dashboard'); // Back to Dashboard default
  const [overwhelmLevel, setOverwhelmLevel] = useState(1);
  const [quietMode, setQuietMode] = useState(false);
  const [reduceClutter, setReduceClutter] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [selectedStarter, setSelectedStarter] = useState("");
  
  // Enhanced sensory controls for inclusive learning
  const [selectedFont, setSelectedFont] = useState('default');
  const [colorFilter, setColorFilter] = useState('none');
  const [layoutMode, setLayoutMode] = useState('standard');
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  
  // Note Taker states
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteTags, setNoteTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [noteFont, setNoteFont] = useState('default');
  const [noteTheme, setNoteTheme] = useState('dark');
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [recognition, setRecognition] = useState(null);
  
  // AI Study Buddy states
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI Learning Assistant! I'm here to help you with your learning journey. You can ask me questions about your studies, get help with concepts, or just chat about your learning goals. What would you like to work on today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(OPENAI_API_KEY || '');

  // AI Summarizer states
  const [selectedNotesForSummary, setSelectedNotesForSummary] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryType, setSummaryType] = useState('key-points'); // key-points, concepts, action-items

  // Timer states
  const [timerMode, setTimerMode] = useState('pomodoro'); // pomodoro, shortBreak, longBreak
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [distractionFree, setDistractionFree] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Break timer states
  const [breakTimeLeft, setBreakTimeLeft] = useState(5 * 60); // 5 minutes default
  const [isBreakRunning, setIsBreakRunning] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale'); // inhale, exhale
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  // Font options for note-taking (including dyslexic fonts)
  const noteFontOptions = [
    { value: 'default', label: 'Default', preview: 'Arial' },
    { value: 'arial', label: 'Arial', preview: 'Arial' },
    { value: 'verdana', label: 'Verdana', preview: 'Verdana' },
    { value: 'georgia', label: 'Georgia', preview: 'Georgia' },
    { value: 'times', label: 'Times New Roman', preview: 'Times New Roman' },
    { value: 'opendyslexic', label: 'OpenDyslexic', preview: 'OpenDyslexic' },
    { value: 'lexend', label: 'Lexend', preview: 'Lexend' },
    { value: 'comicsans', label: 'Comic Sans MS', preview: 'Comic Sans MS' },
    { value: 'atkinson', label: 'Atkinson Hyperlegible', preview: 'Atkinson Hyperlegible' },
  ];

  // Theme options for note-taking
  const themeOptions = [
    { value: 'dark', label: 'Dark Mode', description: 'Dark background' },
    { value: 'light', label: 'Light Mode', description: 'Light background' },
    { value: 'highcontrast', label: 'High Contrast', description: 'Black & white' },
    { value: 'pastel', label: 'Pastel', description: 'Soft colors' },
  ];

  // Tag options for organization
  const tagOptions = [
    { value: 'lecture', label: 'Lecture', color: '#3b82f6' },
    { value: 'homework', label: 'Homework', color: '#ef4444' },
    { value: 'review', label: 'Review', color: '#10b981' },
    { value: 'personal', label: 'Personal', color: '#f59e0b' },
    { value: 'ideas', label: 'Ideas', color: '#8b5cf6' },
  ];

  // Font options for dyslexia-friendly design
  const fontOptions = [
    { value: 'default', label: 'Default', preview: 'Arial' },
    { value: 'opendyslexic', label: 'OpenDyslexic', preview: 'OpenDyslexic' },
    { value: 'comicsans', label: 'Comic Sans', preview: 'Comic Sans MS' },
    { value: 'arial', label: 'Arial', preview: 'Arial' },
    { value: 'verdana', label: 'Verdana', preview: 'Verdana' },
  ];

  // Color filter options for visual processing differences
  const colorFilterOptions = [
    { value: 'none', label: 'None', description: 'Standard colors' },
    { value: 'highcontrast', label: 'High Contrast', description: 'Black & white' },
    { value: 'colorblind', label: 'Colorblind Friendly', description: 'Protanopia safe' },
    { value: 'sepia', label: 'Sepia', description: 'Warm, reduced blue' },
    { value: 'night', label: 'Night Mode', description: 'Dark blue filter' },
  ];

  // Layout options for customizable learning experience
  const layoutOptions = [
    { value: 'standard', label: 'Standard', description: 'Default layout' },
    { value: 'simplified', label: 'Simplified', description: 'Minimal distractions' },
    { value: 'spacious', label: 'Spacious', description: 'Extra spacing' },
    { value: 'compact', label: 'Compact', description: 'Dense layout' },
  ];

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font family
    if (selectedFont === 'opendyslexic') {
      root.style.setProperty('--main-font', 'OpenDyslexic, Arial, sans-serif');
    } else if (selectedFont === 'comicsans') {
      root.style.setProperty('--main-font', 'Comic Sans MS, Arial, sans-serif');
    } else if (selectedFont === 'arial') {
      root.style.setProperty('--main-font', 'Arial, sans-serif');
    } else if (selectedFont === 'verdana') {
      root.style.setProperty('--main-font', 'Verdana, Arial, sans-serif');
    } else if (selectedFont === 'lexend') {
      root.style.setProperty('--main-font', 'Lexend, Arial, sans-serif');
    } else if (selectedFont === 'atkinson') {
      root.style.setProperty('--main-font', 'Atkinson Hyperlegible, Arial, sans-serif');
    } else {
      root.style.setProperty('--main-font', 'system-ui, -apple-system, sans-serif');
    }
    
    // Apply font size - ensure it's applied to the root element
    root.style.setProperty('--font-size-base', `${fontSize}px`);
    
    // Also apply to body for immediate effect
    document.body.style.fontSize = `${fontSize}px`;
    
    // Apply color filters
    if (colorFilter === 'highcontrast') {
      root.style.setProperty('--color-filter', 'contrast(200%) brightness(150%)');
    } else if (colorFilter === 'colorblind') {
      root.style.setProperty('--color-filter', 'hue-rotate(180deg) saturate(150%)');
    } else if (colorFilter === 'sepia') {
      root.style.setProperty('--color-filter', 'sepia(30%) hue-rotate(30deg)');
    } else if (colorFilter === 'night') {
      root.style.setProperty('--color-filter', 'brightness(80%) hue-rotate(200deg)');
    } else {
      root.style.setProperty('--color-filter', 'none');
    }
    
    // Apply high contrast mode
    if (highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }
    
    // Apply layout mode
    root.setAttribute('data-layout-mode', layoutMode);
    
    // Debug logging
    console.log('Accessibility settings updated:', {
      font: selectedFont,
      fontSize: fontSize,
      colorFilter: colorFilter,
      highContrast: highContrast,
      layoutMode: layoutMode
    });
    
  }, [selectedFont, fontSize, colorFilter, highContrast, layoutMode]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognition) {
        try {
          recognition.stop();
          console.log('Recording cleaned up on unmount');
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      }
    };
  }, [recognition]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      setCompletedSessions(prev => prev + 1);
      // Auto switch to break
      if (timerMode === 'pomodoro') {
        setTimerMode('shortBreak');
        setTimeLeft(5 * 60);
      } else {
        setTimerMode('pomodoro');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerMode === 'pomodoro') {
      setTimeLeft(25 * 60);
    } else if (timerMode === 'shortBreak') {
      setTimeLeft(5 * 60);
    } else {
      setTimeLeft(15 * 60);
    }
  };

  const switchMode = (mode) => {
    setTimerMode(mode);
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setTimeLeft(25 * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(5 * 60);
    } else {
      setTimeLeft(15 * 60);
    }
  };

  const formatTotalTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Break timer functions
  const startBreak = () => {
    setIsBreakRunning(true);
    setBreakTimeLeft(5 * 60); // 5 minutes
    setBreathingCycle(0);
    setCurrentMessage(0);
  };

  const pauseBreak = () => {
    setIsBreakRunning(false);
  };

  const resumeBreak = () => {
    setIsBreakRunning(true);
  };

  const resetBreak = () => {
    setIsBreakRunning(false);
    setBreakTimeLeft(5 * 60);
    setBreathingPhase('inhale');
    setBreathingCycle(0);
  };

  const formatBreakTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Break timer useEffect
  useEffect(() => {
    let interval = null;
    if (isBreakRunning && breakTimeLeft > 0) {
      interval = setInterval(() => {
        setBreakTimeLeft(breakTimeLeft => breakTimeLeft - 1);
      }, 1000);
    } else if (breakTimeLeft === 0) {
      setIsBreakRunning(false);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Break Complete!', {
          body: 'Ready to get back to work?',
          icon: '/favicon.ico'
        });
      }
    }
    return () => clearInterval(interval);
  }, [isBreakRunning, breakTimeLeft]);

  // Breathing cycle useEffect
  useEffect(() => {
    let interval = null;
    if (isBreakRunning) {
      interval = setInterval(() => {
        setBreathingPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale');
        if (breathingPhase === 'exhale') {
          setBreathingCycle(prev => prev + 1);
        }
      }, 6000); // 6 seconds per breath cycle (3s inhale, 3s exhale)
    } else {
      // Reset breathing when break is not running
      setBreathingPhase('inhale');
    }
    return () => clearInterval(interval);
  }, [isBreakRunning, breathingPhase]);

  // Message rotation useEffect
  useEffect(() => {
    let interval = null;
    if (isBreakRunning) {
      interval = setInterval(() => {
        setCurrentMessage(prev => (prev + 1) % reassuringMessages.length);
      }, 10000); // Change message every 10 seconds
    }
    return () => clearInterval(interval);
  }, [isBreakRunning]);

  const requestNotificationPermission = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  // Note Taker functions
  const saveNote = () => {
    if (!noteTitle.trim() || !currentNote.trim()) return;
    
    const newNote = {
      id: selectedNote ? selectedNote.id : Date.now(),
      title: noteTitle,
      content: currentNote,
      tags: noteTags,
      createdAt: selectedNote ? selectedNote.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (selectedNote) {
      setNotes(notes.map(note => note.id === selectedNote.id ? newNote : note));
    } else {
      setNotes([...notes, newNote]);
    }

    setSelectedNote(null);
    setNoteTitle('');
    setCurrentNote('');
    setNoteTags([]);
  };

  const deleteNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote(null);
      setNoteTitle('');
      setCurrentNote('');
      setNoteTags([]);
    }
  };

  const selectNote = (note) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    setCurrentNote(note.content);
    setNoteTags(note.tags);
  };

  const addTag = (tag) => {
    if (!noteTags.includes(tag)) {
      setNoteTags([...noteTags, tag]);
    }
  };

  const removeTag = (tag) => {
    setNoteTags(noteTags.filter(t => t !== tag));
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const readNote = (note) => {
    const textToRead = `${note.title}. ${note.content}`;
    speakText(textToRead);
  };

  const startRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onstart = () => {
        setIsRecording(true);
        console.log('Recording started');
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
        console.log('Recording stopped');
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setCurrentNote(prev => prev + ' ' + finalTranscript);
        }
      };
      
      try {
        recognitionInstance.start();
        setRecognition(recognitionInstance);
      } catch (error) {
        console.error('Failed to start recording:', error);
        setIsRecording(false);
      }
    } else {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    }
  };

  const stopRecording = () => {
    if (recognition) {
      try {
        recognition.stop();
        setRecognition(null);
        setIsRecording(false);
        console.log('Recording stopped manually');
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
      }
    }
  };

  // AI Study Buddy functions
  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: userInput.trim(),
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      // You can replace this with your actual API call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey || process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: APP_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful study assistant. Be encouraging, educational, and supportive. Help students understand concepts, provide study tips, and motivate them in their learning journey. Keep responses concise but helpful.'
            },
            ...chatMessages.map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: userInput.trim()
            }
          ],
          max_tokens: APP_CONFIG.maxTokens,
          temperature: APP_CONFIG.temperature
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.choices[0].message.content,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response if API fails
      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `I'm having trouble connecting right now: ${error.message}. Please check your API key and try again.`,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: Date.now(),
        type: 'ai',
        content: "Hi! I'm your AI Learning Assistant! I'm here to help you with your learning journey. You can ask me questions about your studies, get help with concepts, or just chat about your learning goals. What would you like to work on today?",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  // AI Summarizer functions
  const toggleNoteForSummary = (note) => {
    setSelectedNotesForSummary(prev => {
      const isSelected = prev.find(n => n.id === note.id);
      if (isSelected) {
        return prev.filter(n => n.id !== note.id);
      } else {
        return [...prev, note];
      }
    });
  };

  const generateSummary = async () => {
    if (selectedNotesForSummary.length === 0) return;

    setIsSummarizing(true);

    try {
      const combinedContent = selectedNotesForSummary
        .map(note => `Title: ${note.title}\nContent: ${note.content}\nTags: ${note.tags.join(', ')}\n---`)
        .join('\n\n');

      const summaryPrompt = summaryType === 'key-points' 
        ? 'Extract the key points and main ideas from these notes. Focus on the most important concepts and findings.'
        : summaryType === 'concepts'
        ? 'Identify and explain the main concepts and themes from these notes. Group related ideas together.'
        : 'Extract action items, tasks, and next steps from these notes. Focus on what needs to be done.';

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: APP_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful study assistant that creates clear, organized summaries of notes. Focus on extracting the most important information and presenting it in a structured way.'
            },
            {
              role: 'user',
              content: `${summaryPrompt}\n\nNotes to summarize:\n${combinedContent}`
            }
          ],
          max_tokens: 800,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const summaryContent = data.choices[0].message.content;

      const newSummary = {
        id: Date.now(),
        title: `Summary of ${selectedNotesForSummary.length} note${selectedNotesForSummary.length > 1 ? 's' : ''}`,
        content: summaryContent,
        type: summaryType,
        noteIds: selectedNotesForSummary.map(n => n.id),
        createdAt: new Date().toISOString()
      };

      setSummaries(prev => [newSummary, ...prev]);
      setSelectedNotesForSummary([]);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const deleteSummary = (summaryId) => {
    setSummaries(prev => prev.filter(s => s.id !== summaryId));
  };

  const speakSummary = (summary) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(summary.content);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const renderDashboard = () => {
    const handleNotesClick = () => setActiveTab('Note Taker');
    const handleTimerClick = () => setActiveTab('Study Timer');
    const handleCheckInClick = () => {
      setActiveTab('Study Buddy');
    };

    const statCards = getStatCards(notes, completedSessions, handleNotesClick, handleTimerClick, handleCheckInClick);

    return (
      <>
        <h2 className="dash-heading">Dashboard</h2>
        <section className="dash-welcome-card">
          <div className="dash-welcome-text">
            <h1>Welcome, <span className="dash-user-highlight">{email}</span>!</h1>
            <p className="dash-calming-msg">Take a deep breath. You're doing great! Remember to take breaks and be kind to yourself.</p>
          </div>
          <div className="dash-welcome-img">
            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" alt="Calm nature" />
          </div>
        </section>
        <div className="dash-stat-row">
          {statCards.map((card, i) => (
            <div 
              className={`dash-stat-card ${card.isButton ? 'dash-stat-card-button' : ''}`} 
              key={i}
              onClick={card.onClick}
              style={{ cursor: card.onClick ? 'pointer' : 'default' }}
            >
              <div className="dash-stat-icon">
                <span style={{ fontSize: '2rem' }}>{card.icon}</span>
              </div>
              <div className="dash-stat-info">
                <div className="dash-stat-value">{card.value}</div>
                <div className="dash-stat-label">{card.label}</div>
              </div>
              {!card.isButton && (
                <a className="dash-stat-link" onClick={(e) => { e.stopPropagation(); card.onClick(); }}>
                  View &rarr;
                </a>
              )}
            </div>
          ))}
        </div>
      <div className="dash-safety-grid">
        {/* Overwhelm Prevention */}
        <div className="dash-safety-card">
          <div className="dash-safety-title">Overwhelm Prevention</div>
          <div className="dash-overwhelm-content">
            <div className="dash-overwhelm-level">
              <span>How are you feeling?</span>
              <div className="dash-overwhelm-slider">
                {overwhelmLevels.map((level, i) => (
                  <button
                    key={level.level}
                    className={`dash-overwhelm-btn${overwhelmLevel === level.level ? " selected" : ""}`}
                    onClick={() => setOverwhelmLevel(level.level)}
                    aria-label={level.label}
                  >
                    {level.emoji}
                  </button>
                ))}
              </div>
              <div className="dash-overwhelm-message">
                {overwhelmLevels[overwhelmLevel - 1].message}
              </div>
            </div>
            <button className="dash-break-btn" onClick={() => setActiveTab('Take a Break')}>Take a Break</button>
          </div>
        </div>

        {/* Sensory Controls - Simplified */}
        <div className="dash-safety-card">
          <div className="dash-safety-title">Sensory Controls</div>
          <div className="dash-sensory-content">
            <div className="dash-sensory-control">
              <span>Brightness</span>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(e.target.value)}
                className="dash-slider"
              />
              <span>{brightness}%</span>
            </div>
            <div className="dash-sensory-toggle">
              <span>Quiet Mode</span>
              <button
                className={`dash-toggle-btn${quietMode ? " active" : ""}`}
                onClick={() => setQuietMode(!quietMode)}
              >
                <div className="dash-toggle-slider"></div>
              </button>
            </div>
            <div className="dash-sensory-toggle">
              <span>Reduce Clutter</span>
              <button
                className={`dash-toggle-btn${reduceClutter ? " active" : ""}`}
                onClick={() => setReduceClutter(!reduceClutter)}
              >
                <div className="dash-toggle-slider"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Social Communication Support */}
        <div className="dash-safety-card">
          <div className="dash-safety-title">Social Communication</div>
          <div className="dash-social-content">
            <div className="dash-conversation-starter">
              <span>Conversation Starters</span>
              <select
                value={selectedStarter}
                onChange={(e) => setSelectedStarter(e.target.value)}
                className="dash-select"
              >
                <option value="">Choose a starter...</option>
                {conversationStarters.map((starter, i) => (
                  <option key={i} value={starter}>{starter}</option>
                ))}
              </select>
              {selectedStarter && (
                <div className="dash-starter-display">{selectedStarter}</div>
              )}
            </div>
            <div className="dash-social-tips">
              <span>Remember:</span>
              <ul>
                <li>Take turns in conversation</li>
                <li>It's okay to ask for clarification</li>
                <li>You can take time to think</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
  };

  const renderInclusiveLearning = () => (
    <>
      <h2 className="dash-heading">Inclusive Learning Design</h2>
      
      <div className="dash-inclusive-container">
        {/* Font Settings */}
        <div className="dash-inclusive-card">
          <div className="dash-inclusive-header">
            <h3>Typography & Reading</h3>
            <p>Customize fonts and text settings for better readability</p>
          </div>
          
          <div className="dash-inclusive-section">
            <h4>Dyslexia-Friendly Fonts</h4>
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="dash-select"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
            <div className="dash-font-preview" style={{ fontFamily: fontOptions.find(f => f.value === selectedFont)?.preview }}>
              Sample text in {fontOptions.find(f => f.value === selectedFont)?.label}
            </div>
          </div>

          <div className="dash-inclusive-section">
            <h4>Font Size</h4>
            <div className="dash-sensory-control">
              <span>Size</span>
              <input
                type="range"
                min="15"
                max="18"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="dash-slider"
              />
              <span>{fontSize}px</span>
            </div>
          </div>
        </div>

        {/* Visual Settings */}
        <div className="dash-inclusive-card">
          <div className="dash-inclusive-header">
            <h3>Visual Accessibility</h3>
            <p>Adjust colors and contrast for better visual processing</p>
          </div>
          
          <div className="dash-inclusive-section">
            <h4>Color Filters</h4>
            <select
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              className="dash-select"
            >
              {colorFilterOptions.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label} - {filter.description}
                </option>
              ))}
            </select>
            <div className="dash-color-preview">
              <div className="dash-color-sample" style={{ 
                background: colorFilter === 'highcontrast' ? '#000000' : 
                           colorFilter === 'colorblind' ? '#ff6b6b' : 
                           colorFilter === 'sepia' ? '#f4d03f' : 
                           colorFilter === 'night' ? '#2c3e50' : '#6ee7b7' 
              }}>
                Color Sample
              </div>
              <span>{colorFilterOptions.find(f => f.value === colorFilter)?.description}</span>
            </div>
          </div>

          <div className="dash-inclusive-section">
            <h4>High Contrast Mode</h4>
            <div className="dash-sensory-toggle">
              <span>Enable High Contrast</span>
              <button
                className={`dash-toggle-btn${highContrast ? " active" : ""}`}
                onClick={() => setHighContrast(!highContrast)}
              >
                <div className="dash-toggle-slider"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Layout Settings */}
        <div className="dash-inclusive-card">
          <div className="dash-inclusive-header">
            <h3>Layout & Spacing</h3>
            <p>Customize the interface layout for your learning preferences</p>
          </div>
          
          <div className="dash-inclusive-section">
            <h4>Layout Options</h4>
            <select
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value)}
              className="dash-select"
            >
              {layoutOptions.map((layout) => (
                <option key={layout.value} value={layout.value}>
                  {layout.label} - {layout.description}
                </option>
              ))}
            </select>
            <div className="dash-layout-preview">
              <div className="dash-layout-sample">
                <div className="dash-layout-demo" style={{
                  padding: layoutMode === 'spacious' ? '1rem' : layoutMode === 'compact' ? '0.3rem' : '0.5rem',
                  fontSize: layoutMode === 'spacious' ? '1rem' : layoutMode === 'compact' ? '0.8rem' : '0.9rem'
                }}>
                  Layout Preview: {layoutOptions.find(l => l.value === layoutMode)?.label}
                </div>
              </div>
            </div>
          </div>

          <div className="dash-inclusive-section">
            <h4>Quick Presets</h4>
            <div className="dash-preset-buttons">
              <button 
                className="dash-preset-btn"
                onClick={() => {
                  setSelectedFont('opendyslexic');
                  setFontSize(18);
                  setColorFilter('none');
                  setHighContrast(false);
                  setLayoutMode('spacious');
                }}
              >
                Dyslexia-Friendly
              </button>
              <button 
                className="dash-preset-btn"
                onClick={() => {
                  setSelectedFont('arial');
                  setFontSize(16);
                  setColorFilter('highcontrast');
                  setHighContrast(true);
                  setLayoutMode('simplified');
                }}
              >
                High Contrast
              </button>
              <button 
                className="dash-preset-btn"
                onClick={() => {
                  setSelectedFont('comicsans');
                  setFontSize(20);
                  setColorFilter('sepia');
                  setHighContrast(false);
                  setLayoutMode('standard');
                }}
              >
                Reading Focus
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderStudyTimer = () => (
    <>
      <div className="dash-timer-container">
        <div className="dash-timer-main">
          <h2 className="dash-timer-page-heading">Study Timer</h2>
          <div className="dash-timer-card">
            <div className="dash-timer-header">
              <h3>Self-Paced Focus Tools</h3>
              <p>Tools like Pomodoro timers and distraction-free modes allow users to tailor their environment for maximum personal effectiveness — supporting lifelong and self-directed learning.</p>
            </div>
            
            <div className="dash-timer-modes">
              <button 
                className={`dash-timer-mode-btn${timerMode === 'pomodoro' ? ' active' : ''}`}
                onClick={() => switchMode('pomodoro')}
              >
                Focus (25min)
              </button>
              <button 
                className={`dash-timer-mode-btn${timerMode === 'shortBreak' ? ' active' : ''}`}
                onClick={() => switchMode('shortBreak')}
              >
                Short Break (5min)
              </button>
              <button 
                className={`dash-timer-mode-btn${timerMode === 'longBreak' ? ' active' : ''}`}
                onClick={() => switchMode('longBreak')}
              >
                Long Break (15min)
              </button>
            </div>
            
            <div className="dash-timer-display">
              <div className="dash-timer-time">{formatTime(timeLeft)}</div>
              <div className="dash-timer-status">
                {timerMode === 'pomodoro' ? 'Focus Time' : 
                 timerMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </div>
            </div>
            
            <div className="dash-timer-controls">
              {!isRunning ? (
                <button className="dash-timer-start-btn" onClick={startTimer}>
                  Start
                </button>
              ) : (
                <button className="dash-timer-pause-btn" onClick={pauseTimer}>
                  Pause
                </button>
              )}
              <button className="dash-timer-reset-btn" onClick={resetTimer}>
                Reset
              </button>
            </div>
            
            <div className="dash-timer-stats">
              <div className="dash-timer-stat">
                <div className="dash-timer-stat-label">Completed Sessions</div>
                <div className="dash-timer-stat-value">{completedSessions}</div>
              </div>
              <div className="dash-timer-stat">
                <div className="dash-timer-stat-label">Total Focus Time</div>
                <div className="dash-timer-stat-value">{formatTotalTime(completedSessions * 25 * 60)}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dash-distraction-sidebar">
          <div className="dash-distraction-card">
            <div className="dash-distraction-header">
              <h4>Distraction-Free Mode</h4>
              <p>Create a focused environment for deep work and learning</p>
            </div>
            
            <div className="dash-distraction-controls">
              <div className="dash-distraction-toggle">
                <span>Enable Distraction-Free Mode</span>
                <button
                  className={`dash-toggle-btn${distractionFree ? " active" : ""}`}
                  onClick={() => setDistractionFree(!distractionFree)}
                >
                  <div className="dash-toggle-slider"></div>
                </button>
              </div>
            </div>
            
            {distractionFree && (
              <div className="dash-distraction-features">
                <div className="dash-distraction-feature">Browser notifications disabled</div>
                <div className="dash-distraction-feature">Full-screen focus mode</div>
                <div className="dash-distraction-feature">Automatic break reminders</div>
                <div className="dash-distraction-feature">Progress tracking enabled</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderNoteTaker = () => (
    <>
      <h2 className="dash-heading">Note Taker</h2>
      <div className="dash-notetaker-container">
        {/* Left Sidebar - Note List */}
        <div className="dash-notetaker-sidebar">
          <div className="dash-notetaker-header">
            <h3>My Notes</h3>
            <button 
              className="dash-new-note-btn"
              onClick={() => {
                setSelectedNote(null);
                setNoteTitle('');
                setCurrentNote('');
                setNoteTags([]);
              }}
            >
              + New Note
            </button>
          </div>
          
          <div className="dash-search-section">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dash-search-input"
            />
            
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="dash-tag-filter"
            >
              <option value="all">All Tags</option>
              {tagOptions.map(tag => (
                <option key={tag.value} value={tag.value}>{tag.label}</option>
              ))}
            </select>
          </div>
          
          <div className="dash-notes-list">
            {filteredNotes.map(note => (
              <div 
                key={note.id}
                className={`dash-note-item${selectedNote?.id === note.id ? ' active' : ''}`}
                onClick={() => selectNote(note)}
              >
                <div className="dash-note-item-header">
                  <h4>{note.title}</h4>
                  <div className="dash-note-actions">
                    <button 
                      className="dash-read-note-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        readNote(note);
                      }}
                      title="Read this note aloud"
                    >
                      🔊
                    </button>
                    <button 
                      className="dash-delete-note-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      title="Delete this note"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <p>{note.content.substring(0, 100)}...</p>
                <div className="dash-note-tags">
                  {note.tags.map(tag => (
                    <span 
                      key={tag}
                      className="dash-note-tag"
                      style={{ backgroundColor: tagOptions.find(t => t.value === tag)?.color }}
                    >
                      {tagOptions.find(t => t.value === tag)?.label}
                    </span>
                  ))}
                </div>
                <small>{new Date(note.updatedAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Editor Area */}
        <div className="dash-notetaker-main">
          <div className="dash-editor-header">
            <input
              type="text"
              placeholder="Note title..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="dash-note-title-input"
            />
            
            <div className="dash-editor-controls">
              <button 
                className="dash-save-note-btn"
                onClick={saveNote}
                disabled={!noteTitle.trim() || !currentNote.trim()}
              >
                Save
              </button>
              
              <button 
                className={`dash-audio-btn${isSpeaking ? ' active' : ''}`}
                onClick={() => speakText(currentNote)}
                disabled={!currentNote.trim()}
              >
                {isSpeaking ? 'Stop' : 'Read'}
              </button>
              
              {!isRecording ? (
                <button 
                  className="dash-record-btn"
                  onClick={startRecording}
                >
                  Start Recording
                </button>
              ) : (
                <button 
                  className="dash-stop-record-btn"
                  onClick={stopRecording}
                >
                  Stop Recording
                </button>
              )}
            </div>
          </div>
          
          <div className="dash-editor-toolbar">
            <div className="dash-toolbar-section">
              <span>Font:</span>
              <select
                value={noteFont}
                onChange={(e) => setNoteFont(e.target.value)}
                className="dash-font-select"
              >
                {noteFontOptions.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>
            
            <div className="dash-toolbar-section">
              <span>Theme:</span>
              <select
                value={noteTheme}
                onChange={(e) => setNoteTheme(e.target.value)}
                className="dash-theme-select"
              >
                {themeOptions.map(theme => (
                  <option key={theme.value} value={theme.value}>{theme.label}</option>
                ))}
              </select>
            </div>
            
            <div className="dash-toolbar-section">
              <span>Line Spacing:</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={lineSpacing}
                onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                className="dash-spacing-slider"
              />
              <span>{lineSpacing}x</span>
            </div>
          </div>
          
          <div className="dash-editor-content">
            <textarea
              placeholder="Start writing your note here... Use # for headings, • for bullet points, and add emojis for visual organization!"
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              className={`dash-note-editor dash-theme-${noteTheme}`}
              style={{
                fontFamily: noteFont === 'opendyslexic' ? "'Open Sans', Arial, sans-serif" :
                           noteFont === 'lexend' ? "'Lexend', Arial, sans-serif" :
                           noteFont === 'atkinson' ? "'Atkinson Hyperlegible', Arial, sans-serif" :
                           noteFont === 'comicsans' ? "'Comic Sans MS', Arial, sans-serif" :
                           noteFont === 'arial' ? "'Arial', sans-serif" :
                           noteFont === 'verdana' ? "'Verdana', Arial, sans-serif" :
                           noteFont === 'georgia' ? "'Georgia', Arial, sans-serif" :
                           noteFont === 'times' ? "'Times New Roman', Arial, sans-serif" :
                           "'system-ui', -apple-system, sans-serif",
                lineHeight: lineSpacing,
                letterSpacing: noteFont === 'opendyslexic' ? '0.05em' :
                              noteFont === 'lexend' ? '0.02em' :
                              noteFont === 'atkinson' ? '0.03em' : 'normal'
              }}
            />
          </div>
          
          <div className="dash-tags-section">
            <h4>Tags:</h4>
            <div className="dash-tags-container">
              {noteTags.map(tag => (
                <span 
                  key={tag}
                  className="dash-note-tag"
                  style={{ backgroundColor: tagOptions.find(t => t.value === tag)?.color }}
                >
                  {tagOptions.find(t => t.value === tag)?.label}
                  <button onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
            </div>
            
            <div className="dash-add-tags">
              {tagOptions.map(tag => (
                <button
                  key={tag.value}
                  className="dash-add-tag-btn"
                  onClick={() => addTag(tag.value)}
                  disabled={noteTags.includes(tag.value)}
                  style={{ backgroundColor: tag.color }}
                >
                  + {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderStudyBuddy = () => (
    <>
      <h2 className="dash-heading">AI Learning Assistant</h2>
      <div className="dash-studybuddy-container">
        <div className="dash-chat-header">
          <h3>AI Learning Assistant</h3>
          <button 
            className="dash-clear-chat-btn"
            onClick={clearChat}
            title="Clear conversation"
          >
            Clear Chat
          </button>
        </div>
        
        <div className="dash-chat-messages">
          {chatMessages.map(message => (
            <div 
              key={message.id}
              className={`dash-message ${message.type === 'user' ? 'user' : 'ai'}`}
            >
              <div className="dash-message-content">
                <div className="dash-message-avatar">
                  {message.type === 'user' ? '👤' : 'AI'}
                </div>
                <div className="dash-message-text">
                  {message.content}
                </div>
              </div>
              <div className="dash-message-time">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="dash-message ai">
              <div className="dash-message-content">
                <div className="dash-message-avatar">AI</div>
                <div className="dash-message-text">
                  <div className="dash-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="dash-chat-input">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your studies, concepts, or learning goals..."
            className="dash-message-input"
            rows="3"
          />
          <button 
            className="dash-send-btn"
            onClick={sendMessage}
            disabled={!userInput.trim() || isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );

  const renderTakeABreak = () => (
    <>
      <h2 className="dash-heading">Take a Break</h2>
      <div className="dash-break-container">
        <div className="dash-break-content">
          {/* All sections side by side */}
          <div className="dash-break-row">
            {/* Timer Section */}
            <div className="dash-break-timer-section">
              <h3>Break Timer</h3>
              <div className="dash-break-timer-display">
                <div className="dash-break-time">{formatBreakTime(breakTimeLeft)}</div>
                <div className="dash-break-status">
                  {isBreakRunning ? 'Break in Progress' : 'Ready to Start'}
                </div>
              </div>
              <div className="dash-break-controls">
                {!isBreakRunning ? (
                  <button className="dash-break-start-btn" onClick={startBreak}>
                    Start Break
                  </button>
                ) : (
                  <>
                    <button className="dash-break-pause-btn" onClick={pauseBreak}>
                      Pause
                    </button>
                    <button className="dash-break-reset-btn" onClick={resetBreak}>
                      Reset
                    </button>
                  </>
                )}
                {!isBreakRunning && breakTimeLeft < 5 * 60 && (
                  <button className="dash-break-resume-btn" onClick={resumeBreak}>
                    Resume
                  </button>
                )}
              </div>
            </div>

            {/* Reassuring Messages Section */}
            <div className="dash-messages-section">
              <h3>Gentle Reminders</h3>
              <div className="dash-message-display">
                <p className="dash-current-message">
                  {reassuringMessages[currentMessage]}
                </p>
              </div>
            </div>

            {/* Breathing Exercise Section */}
            <div className="dash-breathing-section">
              <h3>Breathing Exercise</h3>
              <div className="dash-breathing-circle">
                <div className={`dash-breathing-animation ${breathingPhase}`}>
                                  <div className="dash-breathing-text">
                  {isBreakRunning 
                    ? (breathingPhase === 'inhale' ? 'Breathe In' : 'Breathe Out')
                    : 'Click Start Break to begin breathing exercise'
                  }
                </div>
                                  <div className="dash-breathing-waves">
                  {isBreakRunning && [...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`dash-wave dash-wave-${i + 1}`}
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: breathingPhase === 'inhale' ? '3s' : '3s'
                      }}
                    />
                  ))}
                </div>
                </div>
              </div>
              <div className="dash-breathing-cycle">
                Cycle {breathingCycle + 1}
              </div>
              <div className="dash-breathing-instructions">
                <p>Follow the expanding and contracting circles to guide your breathing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderAISummarizer = () => (
    <>
      <h2 className="dash-heading">AI Summarizer</h2>
      <div className="dash-summarizer-container">
        <div className="dash-summarizer-header">
          <h3>Note Analysis & Key Takeaways</h3>
          <div className="dash-summary-controls">
            <select
              value={summaryType}
              onChange={(e) => setSummaryType(e.target.value)}
              className="dash-summary-type-select"
            >
              <option value="key-points">Key Points</option>
              <option value="concepts">Main Concepts</option>
              <option value="action-items">Action Items</option>
            </select>
            <button 
              className="dash-generate-summary-btn"
              onClick={generateSummary}
              disabled={selectedNotesForSummary.length === 0 || isSummarizing}
            >
              {isSummarizing ? 'Generating...' : 'Generate Summary'}
            </button>
          </div>
        </div>
        
        <div className="dash-summarizer-content">
          {/* Left Side - Note Selection */}
          <div className="dash-notes-selection">
            <h4>Select Notes to Summarize</h4>
            <div className="dash-notes-grid">
              {notes.map(note => {
                const isSelected = selectedNotesForSummary.find(n => n.id === note.id);
                return (
                  <div 
                    key={note.id}
                    className={`dash-note-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleNoteForSummary(note)}
                  >
                    <div className="dash-note-card-header">
                      <h5>{note.title}</h5>
                      <div className="dash-note-card-tags">
                        {note.tags.map(tag => (
                          <span 
                            key={tag}
                            className="dash-note-tag"
                            style={{ backgroundColor: tagOptions.find(t => t.value === tag)?.color }}
                          >
                            {tagOptions.find(t => t.value === tag)?.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p>{note.content.substring(0, 100)}...</p>
                    <div className="dash-note-card-footer">
                      <small>{new Date(note.updatedAt).toLocaleDateString()}</small>
                      <div className="dash-selection-indicator">
                        {isSelected ? '✓ Selected' : 'Click to select'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Right Side - Summaries */}
          <div className="dash-summaries-section">
            <h4>Generated Summaries</h4>
            <div className="dash-summaries-list">
              {summaries.length === 0 ? (
                <div className="dash-no-summaries">
                  <p>No summaries yet. Select some notes and generate your first summary!</p>
                </div>
              ) : (
                summaries.map(summary => (
                  <div key={summary.id} className="dash-summary-card">
                    <div className="dash-summary-header">
                      <h5>{summary.title}</h5>
                      <div className="dash-summary-actions">
                        <button 
                          className="dash-read-summary-btn"
                          onClick={() => speakSummary(summary)}
                          title="Read summary aloud"
                        >
                          🔊
                        </button>
                        <button 
                          className="dash-delete-summary-btn"
                          onClick={() => deleteSummary(summary.id)}
                          title="Delete summary"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="dash-summary-type-badge">
                      {summary.type === 'key-points' ? 'Key Points' :
                       summary.type === 'concepts' ? 'Main Concepts' : 'Action Items'}
                    </div>
                    <div className="dash-summary-content">
                      {summary.content.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                    <div className="dash-summary-footer">
                      <small>{new Date(summary.createdAt).toLocaleString()}</small>
                      <small>{summary.noteIds.length} note{summary.noteIds.length > 1 ? 's' : ''} analyzed</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="dash-root">
      <aside className="dash-sidebar">
        <div className="dash-logo">LearnInColor</div>
        <nav className="dash-nav">
          {navLinks.map((link, i) => (
            <div 
              key={i} 
              className={`dash-nav-link${activeTab === link.id ? " active" : ""}`}
              onClick={() => setActiveTab(link.id)}
            >
              <span>{link.label}</span>
            </div>
          ))}
        </nav>
        <div className="dash-userinfo">
          <div className="dash-avatar">{username ? username[0].toUpperCase() : "U"}</div>
          <div className="dash-useremail">{username}</div>
          <button className="dash-signout-btn" onClick={() => window.location.href = '/'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </aside>
      <main className="dash-main">
        <div className="dash-main-inner">
          {activeTab === 'Dashboard' ? renderDashboard() : 
           activeTab === 'Study Timer' ? renderStudyTimer() : 
           activeTab === 'Note Taker' ? renderNoteTaker() : 
           activeTab === 'Study Buddy' ? renderStudyBuddy() : 
           activeTab === 'AI Summarizer' ? renderAISummarizer() : 
           activeTab === 'Take a Break' ? renderTakeABreak() : 
           renderInclusiveLearning()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 