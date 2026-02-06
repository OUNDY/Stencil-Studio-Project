import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SearchPopover = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!searchValue) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchValue]);

  const handleClear = () => {
    setSearchValue("");
    inputRef.current?.focus();
  };

  const handleClose = () => {
    setSearchValue("");
    setIsExpanded(false);
  };

  return (
    <div
      ref={containerRef}
      className="flex items-center"
    >
      <motion.div
        className="flex items-center overflow-hidden rounded-full border border-transparent"
        animate={{
          width: isExpanded ? 240 : 40,
          borderColor: isExpanded ? "hsl(var(--border))" : "transparent",
          backgroundColor: isExpanded ? "hsl(var(--background))" : "transparent",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <motion.button
          className="w-10 h-10 flex items-center justify-center flex-shrink-0 hover:bg-accent rounded-full transition-colors"
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(true)}
        >
          <Search className="w-5 h-5 text-muted-foreground" />
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center flex-1 pr-2"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Desen ara..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
              />
              {searchValue ? (
                <button
                  onClick={handleClear}
                  className="flex-shrink-0 hover:text-foreground text-muted-foreground transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="flex-shrink-0 hover:text-foreground text-muted-foreground transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
