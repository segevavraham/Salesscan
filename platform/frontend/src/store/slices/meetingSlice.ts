import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Meeting {
  id: string;
  title: string;
  clientName?: string;
  meetingType: string;
  stage: string;
  startedAt: string;
  duration?: number;
  performanceScore?: number;
}

interface MeetingState {
  meetings: Meeting[];
  currentMeeting: Meeting | null;
  isLoading: boolean;
}

const initialState: MeetingState = {
  meetings: [],
  currentMeeting: null,
  isLoading: false,
};

const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    setMeetings: (state, action: PayloadAction<Meeting[]>) => {
      state.meetings = action.payload;
    },
    setCurrentMeeting: (state, action: PayloadAction<Meeting | null>) => {
      state.currentMeeting = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setMeetings, setCurrentMeeting, setLoading } = meetingSlice.actions;
export default meetingSlice.reducer;
