"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface SessionState {
  id: string;
  code: string;
  status: "waiting" | "active" | "ended";
  current_index: number;
}

interface Response {
  id: string;
  participant_name: string;
  question_index: number;
  answer: string;
}

// Hook mokytojui — stebi atsakymus realiuoju laiku
export function useTeacherSession(code: string) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [participantNames, setParticipantNames] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    if (!code) return;

    // Gauti pradinę sesijos būseną
    supabase
      .from("sessions")
      .select("*")
      .eq("code", code)
      .single()
      .then(({ data }) => {
        if (data) setSession(data);
      });

    // Prenumeruoti atsakymų naujinimus
    const channel = supabase
      .channel(`teacher:${code}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "responses",
        },
        (payload) => {
          const newResponse = payload.new as Response;
          setResponses((prev) => [...prev, newResponse]);
          setParticipantNames((prev) =>
            new Set([...prev, newResponse.participant_name])
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `code=eq.${code}`,
        },
        (payload) => {
          setSession(payload.new as SessionState);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code]);

  const updateSession = useCallback(
    async (updates: Partial<SessionState>) => {
      await supabase.from("sessions").update(updates).eq("code", code);
    },
    [code]
  );

  return {
    session,
    responses,
    participantCount: participantNames.size,
    updateSession,
  };
}

// Hook mokiniui — stebi sesijos pokyčius
export function useStudentSession(code: string) {
  const [session, setSession] = useState<SessionState | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!code) return;

    supabase
      .from("sessions")
      .select("*")
      .eq("code", code)
      .single()
      .then(({ data }) => {
        if (data) setSession(data);
      });

    const channel = supabase
      .channel(`student:${code}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `code=eq.${code}`,
        },
        (payload) => {
          setSession(payload.new as SessionState);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code]);

  const submitAnswer = useCallback(
    async (params: {
      participantName: string;
      questionIndex: number;
      answer: string;
      contentItemId?: string;
    }) => {
      if (!session) return;
      await supabase.from("responses").insert({
        session_id: session.id,
        participant_name: params.participantName,
        question_index: params.questionIndex,
        answer: params.answer,
        content_item_id: params.contentItemId,
      });
    },
    [session]
  );

  return { session, submitAnswer };
}
