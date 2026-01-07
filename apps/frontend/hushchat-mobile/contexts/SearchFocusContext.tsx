import React, { createContext, useContext, useRef, useCallback } from "react";
import { TextInput } from "react-native";

type SearchFocusContextType = {
  searchInputRef: React.RefObject<TextInput | null>;
  focusSearch: () => void;
  registerSearchInput: (ref: React.RefObject<TextInput | null>) => void;
};

const SearchFocusContext = createContext<SearchFocusContextType | null>(null);

export function SearchFocusProvider({ children }: { children: React.ReactNode }) {
  const searchInputRef = useRef<TextInput>(null);
  const registeredRef = useRef<React.RefObject<TextInput | null> | null>(null);

  const focusSearch = useCallback(() => {
    const ref = registeredRef.current || searchInputRef;
    ref?.current?.focus();
  }, []);

  const registerSearchInput = useCallback((ref: React.RefObject<TextInput | null>) => {
    registeredRef.current = ref;
  }, []);

  return (
    <SearchFocusContext.Provider value={{ searchInputRef, focusSearch, registerSearchInput }}>
      {children}
    </SearchFocusContext.Provider>
  );
}

export function useSearchFocus() {
  const context = useContext(SearchFocusContext);
  if (!context) {
    throw new Error("useSearchFocus must be used within SearchFocusProvider");
  }
  return context;
}
