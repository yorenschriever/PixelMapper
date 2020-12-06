import React, { useEffect } from "react";

export const useHandleOutsideClick = (ref:React.MutableRefObject<HTMLDivElement | null>,callback: () => void) => {
    useEffect(() => {
        const handleClickOutside = (event : MouseEvent) => {
            if (ref?.current && !ref.current.contains((event as any).target)) 
                callback();
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => { document.removeEventListener("mousedown", handleClickOutside) };
    }, [ref,callback]);
}