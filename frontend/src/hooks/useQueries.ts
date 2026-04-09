import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Exam, UserProfile, StudyStatus } from '../backend';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      if (isFetching || loginStatus === 'logging-in') {
        throw new Error('Backend is initializing. Please wait...');
      }
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      console.error('Profile save error:', error);
      toast.error(error.message || 'Failed to save profile');
    },
  });
}

export function useGetAllExams() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Exam[]>({
    queryKey: ['exams'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not available');
      return actor.getAllExams();
    },
    enabled: !!actor && !!identity && !isFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useAddExam() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subject, date, time }: { subject: string; date: bigint; time: string }) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      if (isFetching || loginStatus === 'logging-in') {
        throw new Error('Backend is initializing. Please wait...');
      }
      return actor.addExam(subject, date, time);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam added successfully');
    },
    onError: (error: Error) => {
      console.error('Add exam error:', error);
      toast.error(error.message || 'Failed to add exam');
    },
  });
}

export function useUpdateExam() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, subject, date, time }: { id: bigint; subject: string; date: bigint; time: string }) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      if (isFetching || loginStatus === 'logging-in') {
        throw new Error('Backend is initializing. Please wait...');
      }
      return actor.updateExam(id, subject, date, time);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam updated successfully');
    },
    onError: (error: Error) => {
      console.error('Update exam error:', error);
      toast.error(error.message || 'Failed to update exam');
    },
  });
}

export function useDeleteExam() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      if (isFetching || loginStatus === 'logging-in') {
        throw new Error('Backend is initializing. Please wait...');
      }
      return actor.deleteExam(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Delete exam error:', error);
      toast.error(error.message || 'Failed to delete exam');
    },
  });
}

export function useAddStudyTopic() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, name }: { examId: bigint; name: string }) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      if (isFetching || loginStatus === 'logging-in') {
        throw new Error('Backend is initializing. Please wait...');
      }
      return actor.addStudyTopic(examId, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Topic added successfully');
    },
    onError: (error: Error) => {
      console.error('Add topic error:', error);
      toast.error(error.message || 'Failed to add topic');
    },
  });
}

export function useUpdateTopicStatus() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, topicId, status }: { examId: bigint; topicId: bigint; status: StudyStatus }) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      if (isFetching || loginStatus === 'logging-in') {
        throw new Error('Backend is initializing. Please wait...');
      }
      return actor.updateTopicStatus(examId, topicId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: (error: Error) => {
      console.error('Update topic status error:', error);
      toast.error(error.message || 'Failed to update topic status');
    },
  });
}

export function useRecordExamScore() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, score }: { examId: bigint; score: bigint }) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      if (isFetching || loginStatus === 'logging-in') {
        throw new Error('Backend is initializing. Please wait...');
      }
      return actor.recordExamScore(examId, score);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Score recorded successfully');
    },
    onError: (error: Error) => {
      console.error('Record score error:', error);
      toast.error(error.message || 'Failed to record score');
    },
  });
}
