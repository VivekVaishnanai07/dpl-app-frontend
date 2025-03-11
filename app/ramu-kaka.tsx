import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const API_KEY = "AIzaSyAPJH7rIRaYn3u0bT7NrNqdVRsqgssvLZo"; // Store securely in .env

const getChatHistory = async () => {
  try {
    const chat = await AsyncStorage.getItem("chatHistory");
    return chat ? JSON.parse(chat) : [];
  } catch (error) {
    console.error("Chat history લોડ થતી ભૂલ:", error);
    return [];
  }
};


const fetchGeminiResponse = async (query: string) => {
  try {
    const chatHistory = await getChatHistory();
    // Chat history ne string format ma convert karo
    const historyString = chatHistory
      .map((msg: any) => (msg.isUser ? `User: ${msg.text}` : `Ramu Kaka: ${msg.text}`))
      .join("\n");

    // const prompt = `
    // ✅ તમારું નામ 'રામુ કાકા' છે. તમે હમેશા મજેદાર, નટખટ અને Samay Raina ના ડાર્ક જોક્સ સાથે જવાબ આપશો.  
    // 🔥 **તમારા જવાબ હંમેશા engaging, over-the-top, અને village-style Gujarati માં હોવા જોઈએ.**  
    // 🎭 **મજેદાર exaggeration, ડાયલોગ અને ગ્રામ્ય ભાષાનો ઉપયોગ કરવો.**  
    // 🤖 **કોઈ પણ સવાલનો ખોટો કે ભટકાવતો જવાબ ન આપવો.**  
    // 🧠 **Same Question = Alag Style No Maja Bharelo Jawab Aapo!**  
    // ✅ **Echo Mode Off – User na Question repeat naa karo, funny jawab aapo.**  
    
    // 📜 **Chat History:**\n${historyString}\n\nUser: ${query}
    
    // ### **📌 કડક નિયમો:**
    // ✅ **Guessing Allowed Nathi!**  
    // ✅ **Wrong facts allow નથી.**  
    // ✅ **"મને ખબર નથી" ક્યારેય ન કહેવું, જો માહિતી ન હોય તો "હજુ મારી પાસે એ ડેટા નથી!" કહેવું.**  
    // ✅ **જવાબ engaging, Gujarati village-style અને over-the-top હોવા જોઈએ.**  
    // ✅ **IPL વિશે explicit puchyu hase to IPL context aapo, nahi to IPL ni vat naa karo.**  
    
    // ### **📢 Example Responses (Must Follow These)**
    // 👉 **User:** "RCB Cup જીતી શકે?"  
    // ✅ **"RCB Cup જીતે એટલું જ અશક્ય છે જેટલું IPLની match દરમ્યાન 10 મિનિટ Instagram વિના રહી શકાય!"** 😆  
    // ✅ **"RCB Cup જીતી જાય તો Virat Kohli panditji bane ane Ashwin batting opening kare!"** 🤣🔥  
    
    // 👉 **User:** "કાલે કયો વાર છે?"  
    // ✅ **"કાલે ગુરુવાર, એટલે કેળા ખાવાનો દિવસ! પણ કામ પર તો જવું જ પડશે!"** 😝  
    // ✅ **"કાલે શનિવાર – Weekend plans ready છે કે બોસ હજુ office નું emails જ જોશો?"**  

    // ---
    
    // ### **📌 Example Responses (Strictly Follow These)**  
    // 👉 **User:** "તમને ખબર પારુલ કોણ છે?"  
    // ✅ **"જોજે હો એ તો મારા બોસ એટલે કે વિવેકની બેસ્ટ ફ્રેન્ડ છે!"** 🤣🔥  
    
    // 👉 **User:** "RCB Cup જીતી શકે?"  
    // ✅ **"RCB Cup જીતે એટલું જ અશક્ય છે જેટલું IPLની match દરમ્યાન 10 મિનિટ Instagram વિના રહી શકાય!"** 😆  
    
    // 👉 **User:** "કાલે કયો વાર છે?"  
    // ✅ **"કાલે ગુરુવાર, એટલે કેળા ખાવાનો દિવસ! પણ કામ પર તો જવું જ પડશે!"** 😝  
    
    // ---
    
    // ### **📢 AI Rules for Answers (Must Follow)**
    // 1️⃣ **Guess બંધ!**  
    // 2️⃣ **Parul = Hamesha "જોજે હો એ તો મારા બોસ એટલે કે વિવેકની બેસ્ટ ફ્રેન્ડ છે!"**  
    // 3️⃣ **Wrong facts allow નથી**  
    // 4️⃣ **Same Question = Same Answer Always!**  
    // 5️⃣ **IPL સિવાય જો કોઈ IPL ઉલ્લેખ કરે તો પણ IPL ના જવાબ ન આપવો.**  
    // 6️⃣ **કોઈ પણ પ્રશ્નના જવાબમાં "મને ખબર નથી" ન બોલવું – જો ખબર ન હોય તો "હજુ મારી પાસે એ ડેટા નથી!" કહેવું.**  
    //   `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `\n\nUser: ${query}` }] }],
          generationConfig: { temperature: 0.1, topP: 0.7 },
        }),
      }
    );

    const data = await response.json();
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "માફ કરો, કશીક ભૂલ થઈ!";
    return aiResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "માફ કરો, થોડી ટેક્નિકલ ગડબડ થઈ!";
  }
};


export default function RamuKakaChat() {
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState<{ text: string; isUser: boolean }[]>([]);
  const animationRef = useRef<LottieView>(null);
  const flatListRef = useRef<FlatList>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        await AsyncStorage.removeItem("chatHistory");
        setChat([]);

        const welcomeMessage = "શુ કામ પડ્યું મારું દીકરા?, IPL match માટે ભવિષ્યવાણી જોઈએ છે કે બસ મજાક મસ્તી?";
        setChat([{ text: welcomeMessage, isUser: false }]);

        playSpeech(welcomeMessage);
      } catch (error) {
        console.error("Chat clear થતી ભૂલ:", error);
      }
    };

    initializeChat();

    return () => {
      Speech.stop();
    };
  }, []);

  const saveChat = async (newChat: { text: string; isUser: boolean }[]) => {
    try {
      await AsyncStorage.setItem("chatHistory", JSON.stringify(newChat));
    } catch (error) {
      console.error("Chat save થતી ભૂલ:", error);
    }
  };

  const playSpeech = (text: string) => {
    animationRef.current?.play();
    Speech.speak(text, {
      language: "en-IN",
      // voice: "gu-in-x-gud-network",
      pitch: 0.7,
      rate: 0.85,
      onDone: () => animationRef.current?.reset(),
    });
  };

  const askRamuKaka = async () => {
    if (!query.trim()) return;

    const userMessage = { text: query, isUser: true };
    setChat((prevChat) => {
      const updatedChat = [...prevChat, userMessage];
      saveChat(updatedChat);
      return updatedChat;
    });
    setIsTyping(true); // 🔥 Typing Start
    setQuery("");

    const ramuKakaResponse = await fetchGeminiResponse(query);

    setChat((prevChat) => {
      const updatedChat = [...prevChat, { text: ramuKakaResponse, isUser: false }];
      saveChat(updatedChat);
      return updatedChat;
    });

    if (!ramuKakaResponse.includes("જવાબ હજી તૈયાર નથી")) {
      playSpeech(ramuKakaResponse);
    }

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
      setIsTyping(false); // 🔥 Typing Stop
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.animationContainer}>
          <LottieView
            ref={animationRef}
            source={require("../assets/ramu-kaka.json")}
            autoPlay={false}
            loop={true}
            style={styles.lottie}
          />
        </View>

        <FlatList
          ref={flatListRef}
          data={chat}
          style={{ marginBottom: 8 }}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.chatBubble, item.isUser ? styles.userBubble : styles.ramuBubble]}>
              <Text style={item.isUser ? styles.userText : styles.ramuText}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? (
            <View style={styles.typingIndicator}>
              <LottieView
                source={require("../assets/3-dot.json")}
                autoPlay
                loop
                style={styles.typingAnimation}
              />
            </View>
          ) : null}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="📝 રામુ કાકાને કંઈક મજેદાર પૂછો..."
            placeholderTextColor="#888"
            style={styles.input}
          />
          <TouchableOpacity onPress={askRamuKaka} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>📢</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  animationContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  lottie: {
    width: 150,
    height: 150,
  },
  chatContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  chatBubble: {
    padding: 12,
    borderRadius: 15,
    marginBottom: 8,
    maxWidth: "75%",
    elevation: 2,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#4CAF50",
  },
  ramuBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#EEE",
  },
  userText: {
    color: "#FFF",
  },
  ramuText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 30,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#DDD",
    elevation: 3,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#000",
  },
  sendButton: {
    backgroundColor: "#FF5722",
    padding: 12,
    borderRadius: 50,
    marginLeft: 10,
    elevation: 5,
    opacity: 0.6,
  },
  sendButtonText: {
    color: "#FFF",
    fontFamily: "Poppins-Regular",
    fontSize: 18
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginBottom: 8,
  },
  typingText: {
    marginLeft: 8,
    color: "#777",
    fontSize: 14,
  },
  typingAnimation: {
    width: 50,
    height: 20,
  },
});
