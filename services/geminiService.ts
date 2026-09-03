export const generateBackgroundImage = async (prompt: string, userApiKey?: string): Promise<string> => {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.imageBase64) {
        return data.imageBase64;
      }
    }
    throw new Error("Failed to generate image via backend");
  } catch (error) {
    console.error("Error generating image:", error);
    
    // Fallback to high-quality aesthetic backgrounds if API fails
    const fallbacks = [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1080&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1080&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1080&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1080&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1080&auto=format&fit=crop"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
};
