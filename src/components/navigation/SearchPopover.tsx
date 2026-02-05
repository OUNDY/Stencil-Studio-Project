import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

export const SearchPopover = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOpen = isHovered || isActive;

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsActive(false);
        setIsHovered(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setSearchValue("");
    setIsActive(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isActive && setIsHovered(false)}
    >
      <motion.button
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsActive(true)}
      >
        <Search className="w-5 h-5 text-muted-foreground" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0, x: 20 }}
            animate={{ opacity: 1, width: 280, x: 0 }}
            exit={{ opacity: 0, width: 0, x: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-1/2 -translate-y-1/2 overflow-hidden"
          >
            <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 shadow-lg">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Desen ara..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setIsActive(true)}
                className="border-0 bg-transparent h-auto p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {searchValue && (
                <button
                  onClick={handleClear}
                  className="flex-shrink-0 hover:text-foreground text-muted-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
