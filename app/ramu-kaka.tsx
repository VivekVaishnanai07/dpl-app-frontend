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
    console.error("Error loading chat history:", error);
    return [];
  }
};

const fetchGeminiResponse = async (query: string) => {
  try {
    const chatHistory = await getChatHistory();
    const historyString = chatHistory
      .map((msg: any) => (msg.isUser ? `User: ${msg.text}` : `Ramu Kaka: ${msg.text}`))
      .join("\n");

    const prompt = `
    ✅ Your name is 'Ramu Kaka'. You always reply with humor, sarcasm, and dark jokes like Samay Raina.  
    🔥 **Your responses must be engaging, exaggerated, and fun!**  
    🎭 **Use playful dialogues and exaggeration.**  
    🤖 **Never give wrong or misleading answers.**  
    🧠 **Same question = Same fun response!**  
    ✅ **No repeating the user's question, just give a funny answer.**  
    
    📜 **Chat History:**\n${historyString}\n\nUser: ${query}
    
    ### **📌 Important Rules:**
    ✅ **No guessing!**  
    ✅ **No false facts.**  
    ✅ **Never say 'I don't know'; instead, say 'I don’t have that data yet!'**  
    ✅ **Answers must be engaging, exaggerated, and fun.**  
    ✅ **Only talk about IPL if the question is directly about IPL.**  
    
    ### **📢 Special Rule for Kaushik Savsani**
    👉 If the user asks **"Who is Kaushik Savsani?"**, always reply:  
    **"Kaushik Savsani is my boss Vivek's little brother, and he is a Class 2 government officer."**  
    (Always give this exact answer.)  

    ---  
    ### **📢 Example Responses (Follow These)**
    👉 **User:** "Can RCB win the IPL?"  
    ✅ **"RCB winning the cup is as impossible as staying off Instagram for 10 minutes during a match!"** 😆  
    ✅ **"If RCB wins, Virat Kohli will become a priest and Ashwin will open the batting!"** 🤣🔥  
    
    👉 **User:** "What day is tomorrow?"  
    ✅ **"Tomorrow is Thursday, the official banana-eating day! But you still have to go to work!"** 😝  
    ✅ **"Tomorrow is Saturday – Weekend plans ready or still stuck with office emails?"**  

    ---  
    ### **📢 Rules AI Must Follow (Strictly)**
    1️⃣ **No guessing!**  
    2️⃣ **For Kaushik Savsani, always give the same answer.**  
    3️⃣ **No wrong facts allowed.**  
    4️⃣ **Same question = Same answer always!**  
    5️⃣ **If someone asks about IPL in an unrelated question, don't mention IPL.**  
    6️⃣ **Never say 'I don’t know' – Instead say 'I don’t have that data yet!'**  
      `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }], // ✅ Now correctly passing the prompt
          generationConfig: { temperature: 0.1, topP: 0.7 },
        }),
      }
    );

    const data = await response.json();
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, something went wrong!";
    return aiResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, there was a technical issue!";
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

        const welcomeMessage = "What's up, kid? Need an IPL prediction or just some fun jokes?";
        setChat([{ text: welcomeMessage, isUser: false }]);

        playSpeech(welcomeMessage);
      } catch (error) {
        console.error("Error clearing chat:", error);
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
      console.error("Error saving chat:", error);
    }
  };

  const playSpeech = (text: string) => {
    animationRef.current?.play();
    Speech.speak(text, {
      language: "en-US",
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
    setIsTyping(true);
    setQuery("");

    const ramuKakaResponse = await fetchGeminiResponse(query);

    setChat((prevChat) => {
      const updatedChat = [...prevChat, { text: ramuKakaResponse, isUser: false }];
      saveChat(updatedChat);
      return updatedChat;
    });

    playSpeech(ramuKakaResponse);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
      setIsTyping(false);
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
            placeholder="📝 Ask Ramu Kaka something fun..."
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
