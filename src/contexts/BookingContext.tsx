"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type BuildingId = string; // Changed to string to work with Azure API UUIDs
type BookingType = "desk" | "office" | "meeting_room";
type Floor = "Ground" | "1st" | "2nd";

interface BookingState {
  building?: BuildingId;
  floor?: Floor;
  type?: BookingType;
  date?: string;
  startTime?: string;
  endTime?: string;
  spaceId?: string;
  guests?: string[];
  notes?: string;
}

interface BookingContextType {
  bookingState: BookingState;
  setBuilding: (building: BuildingId) => void;
  setFloor: (floor: Floor | undefined) => void;
  setType: (type: BookingType) => void;
  setDate: (date: string) => void;
  setTime: (start: string, end: string) => void;
  setSpace: (spaceId: string) => void;
  setGuests: (guests: string[]) => void;
  setNotes: (notes: string) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingState, setBookingState] = useState<BookingState>({});

  const setBuilding = (building: BuildingId) => {
    setBookingState((prev) => ({ ...prev, building }));
  };

  const setFloor = (floor: Floor | undefined) => {
    setBookingState((prev) => ({ ...prev, floor }));
  };

  const setType = (type: BookingType) => {
    setBookingState((prev) => ({ ...prev, type }));
  };

  const setDate = (date: string) => {
    setBookingState((prev) => ({ ...prev, date }));
  };

  const setTime = (startTime: string, endTime: string) => {
    setBookingState((prev) => ({ ...prev, startTime, endTime }));
  };

  const setSpace = (spaceId: string) => {
    setBookingState((prev) => ({ ...prev, spaceId }));
  };

  const setGuests = (guests: string[]) => {
    setBookingState((prev) => ({ ...prev, guests }));
  };

  const setNotes = (notes: string) => {
    setBookingState((prev) => ({ ...prev, notes }));
  };

  const resetBooking = () => {
    setBookingState({});
  };

  return (
    <BookingContext.Provider
      value={{
        bookingState,
        setBuilding,
        setFloor,
        setType,
        setDate,
        setTime,
        setSpace,
        setGuests,
        setNotes,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return context;
}
