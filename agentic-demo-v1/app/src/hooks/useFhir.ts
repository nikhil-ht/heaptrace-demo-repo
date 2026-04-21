import { useQuery } from '@tanstack/react-query';
import { fhirClient } from '../api/fhirClient';

export const usePatients = () =>
  useQuery({ queryKey: ['patients'], queryFn: fhirClient.listPatients });

export const usePatient = (id: string) =>
  useQuery({ queryKey: ['patient', id], queryFn: () => fhirClient.getPatient(id), enabled: !!id });

export const useObservations = (patientId: string, code: string) =>
  useQuery({
    queryKey: ['observation', patientId, code],
    queryFn: () => fhirClient.searchObservations(patientId, code),
    enabled: !!patientId,
  });

export const useConditions = (patientId: string) =>
  useQuery({
    queryKey: ['conditions', patientId],
    queryFn: () => fhirClient.getConditions(patientId),
    enabled: !!patientId,
  });

export const useMedications = (patientId: string) =>
  useQuery({
    queryKey: ['medications', patientId],
    queryFn: () => fhirClient.getMedications(patientId),
    enabled: !!patientId,
  });

export const useEncounters = (patientId: string) =>
  useQuery({
    queryKey: ['encounters', patientId],
    queryFn: () => fhirClient.getEncounters(patientId),
    enabled: !!patientId,
  });

export const useAllergies = (patientId: string) =>
  useQuery({
    queryKey: ['allergies', patientId],
    queryFn: () => fhirClient.getAllergies(patientId),
    enabled: !!patientId,
  });
