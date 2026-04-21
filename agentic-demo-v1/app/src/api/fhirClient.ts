import axios from 'axios';

const http = axios.create({ baseURL: '/fhir' });

export interface FhirBundle<T = any> {
  resourceType: 'Bundle';
  type: string;
  total?: number;
  entry?: Array<{ resource: T }>;
}

const unwrap = <T>(bundle: FhirBundle<T>): T[] =>
  (bundle.entry ?? []).map((e) => e.resource);

export const fhirClient = {
  async listPatients() {
    const { data } = await http.get<FhirBundle>('/Patient');
    return unwrap(data);
  },
  async getPatient(id: string) {
    const { data } = await http.get(`/Patient/${id}`);
    return data;
  },
  async searchObservations(patientId: string, code: string) {
    const { data } = await http.get<FhirBundle>('/Observation', {
      params: { patient: patientId, code },
    });
    return unwrap(data);
  },
  async getConditions(patientId: string) {
    const { data } = await http.get<FhirBundle>('/Condition', {
      params: { patient: patientId },
    });
    return unwrap(data);
  },
  async getMedications(patientId: string) {
    const { data } = await http.get<FhirBundle>('/MedicationRequest', {
      params: { patient: patientId, status: 'active' },
    });
    return unwrap(data);
  },
  async getEncounters(patientId: string) {
    const { data } = await http.get<FhirBundle>('/Encounter', {
      params: { patient: patientId },
    });
    return unwrap(data);
  },
  async getAllergies(patientId: string) {
    const { data } = await http.get<FhirBundle>('/AllergyIntolerance', {
      params: { patient: patientId },
    });
    return unwrap(data);
  },
};
