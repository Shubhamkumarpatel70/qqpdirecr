import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const QP = () => {
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [batches, setBatches] = useState([]);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // For demo, using static data. Replace with API calls as needed.
  useEffect(() => {
    // Fetch colleges from backend
    axios.get('/api/academic/colleges')
      .then(res => setColleges(res.data))
      .catch(err => console.error('Error fetching colleges:', err));
  }, []);

  useEffect(() => {
    if (selectedCollege) {
      // Fetch programs for selected college
      axios.get('/api/academic/programs')
        .then(res => setPrograms(res.data))
        .catch(err => console.error('Error fetching programs:', err));
      setSelectedProgram('');
      setBranches([]);
      setSelectedBranch('');
      setBatches([]);
      setSelectedBatch('');
      setYears([]);
      setSelectedYear('');
      setSubjects([]);
      setSelectedSubject('');
    }
  }, [selectedCollege]);

  useEffect(() => {
    if (selectedProgram) {
      // Fetch branches for selected program
      axios.get('/api/academic/branches')
        .then(res => setBranches(res.data))
        .catch(err => console.error('Error fetching branches:', err));
      setSelectedBranch('');
      setBatches([]);
      setSelectedBatch('');
      setYears([]);
      setSelectedYear('');
      setSubjects([]);
      setSelectedSubject('');
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedBranch) {
      // Fetch batches for selected branch
      axios.get('/api/academic/batches')
        .then(res => setBatches(res.data))
        .catch(err => console.error('Error fetching batches:', err));
      setSelectedBatch('');
      setYears([]);
      setSelectedYear('');
      setSubjects([]);
      setSelectedSubject('');
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedBatch) {
      // Fetch years for selected batch
      axios.get('/api/academic/years')
        .then(res => setYears(res.data))
        .catch(err => console.error('Error fetching years:', err));
      setSelectedYear('');
      setSubjects([]);
      setSelectedSubject('');
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedYear) {
      // Fetch subjects for selected year
      axios.get('/api/academic/subjects')
        .then(res => setSubjects(res.data))
        .catch(err => console.error('Error fetching subjects:', err));
      setSelectedSubject('');
    }
  }, [selectedYear]);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Select Question Paper Criteria</h1>

      <label className="block mb-2 font-semibold">College</label>
      <select
        className="w-full mb-4 p-2 border rounded"
        value={selectedCollege}
        onChange={(e) => setSelectedCollege(e.target.value)}
      >
        <option value="">Select College</option>
        {colleges.map((college) => (
          <option key={college} value={college}>{college}</option>
        ))}
      </select>

      <label className="block mb-2 font-semibold">Program</label>
      <select
        className="w-full mb-4 p-2 border rounded"
        value={selectedProgram}
        onChange={(e) => setSelectedProgram(e.target.value)}
        disabled={!programs.length}
      >
        <option value="">Select Program</option>
        {programs.map((program) => (
          <option key={program} value={program}>{program}</option>
        ))}
      </select>

      <label className="block mb-2 font-semibold">Branch</label>
      <select
        className="w-full mb-4 p-2 border rounded"
        value={selectedBranch}
        onChange={(e) => setSelectedBranch(e.target.value)}
        disabled={!branches.length}
      >
        <option value="">Select Branch</option>
        {branches.map((branch) => (
          <option key={branch} value={branch}>{branch}</option>
        ))}
      </select>

      <label className="block mb-2 font-semibold">Batch</label>
      <select
        className="w-full mb-4 p-2 border rounded"
        value={selectedBatch}
        onChange={(e) => setSelectedBatch(e.target.value)}
        disabled={!batches.length}
      >
        <option value="">Select Batch</option>
        {batches.map((batch) => (
          <option key={batch} value={batch}>{batch}</option>
        ))}
      </select>

      <label className="block mb-2 font-semibold">Year</label>
      <select
        className="w-full mb-4 p-2 border rounded"
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        disabled={!years.length}
      >
        <option value="">Select Year</option>
        {years.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>

      <label className="block mb-2 font-semibold">Subject</label>
      <select
        className="w-full mb-4 p-2 border rounded"
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        disabled={!subjects.length}
      >
        <option value="">Select Subject</option>
        {subjects.map((subject) => (
          <option key={subject} value={subject}>{subject}</option>
        ))}
      </select>
    </div>
  );
};

export default QP;
