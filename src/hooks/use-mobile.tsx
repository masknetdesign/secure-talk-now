
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const updateMatch = () => setMatches(media.matches);
    
    // Set initial value
    updateMatch();
    
    // Setup listeners for changes
    media.addEventListener("change", updateMatch);
    
    // Cleanup
    return () => {
      media.removeEventListener("change", updateMatch);
    };
  }, [query]);

  return matches;
}

// Export the useIsMobile hook that is being imported in the sidebar component
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)");
}
