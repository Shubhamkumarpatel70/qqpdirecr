import React, { useState, useEffect } from 'react';
import api from '../utils/axios';

const PYQ = () => {
  const [pyqs, setPyqs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    course: '',
    year: '',
    semester: '',
    subject: ''
  });

  useEffect(() => {
    fetchAcademicData();
    fetchPYQs();
  }, []);

  useEffect(() => {
    fetchPYQs();
  }, [filters]);

  const fetchAcademicData = async () => {
    try {
      const [coursesRes, yearsRes, semestersRes, subjectsRes] = await Promise.all([
        api.get('/api/academic/courses'),
        api.get('/api/academic/years'),
        api.get('/api/academic/semesters'),
        api.get('/api/academic/subjects')
      ]);
      setCourses(coursesRes.data);
      setYears(yearsRes.data);
      setSemesters(semestersRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Error fetching academic data:', error);
    }
  };

  const fetchPYQs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.course) params.course = filters.course;
      if (filters.year) params.year = filters.year;
      if (filters.semester) params.semester = filters.semester;
      if (filters.subject) params.subject = filters.subject;

      const response = await api.get('/api/pyqs', { params });
      setPyqs(response.data);
    } catch (error) {
      console.error('Error fetching PYQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Previous Year Questions (PYQ)</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access a collection of previous year question papers to help you prepare effectively for your exams.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filter PYQs</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.course}
              onChange={(e) => handleFilterChange('course', e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.name}</option>
              ))}
            </select>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year._id} value={year._id}>{year.year}</option>
              ))}
            </select>
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Semesters</option>
              {semesters.map(sem => (
                <option key={sem._id} value={sem._id}>{sem.name}</option>
              ))}
            </select>
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Subjects</option>
              {subjects.map(sub => (
                <option key={sub._id} value={sub._id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available PYQs</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : pyqs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No PYQs found matching the filters.</p>
          ) : (
            <ul className="space-y-4">
              {pyqs.map(pyq => (
                <li key={pyq._id} className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-indigo-600 text-lg">{pyq.title}</h3>
                      <p className="text-gray-600 mt-1">{pyq.content}</p>
                      <div className="flex gap-2 mt-2 text-sm text-gray-500">
                        <span>Course: {pyq.course?.name}</span>
                        <span>Year: {pyq.year?.year}</span>
                        <span>Semester: {pyq.semester?.name}</span>
                        <span>Subject: {pyq.subject?.name}</span>
                      </div>
                    </div>
                  {pyq.file && pyq.status !== 'coming soon' && (
                    <a
                      href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${pyq.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline ml-4"
                    >
                      Download File
                    </a>
                  )}
                </div>
                {pyq.link && pyq.status !== 'coming soon' && (
                  <a
                    href={pyq.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mt-2 inline-block"
                  >
                    Preview Link
                  </a>
                )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PYQ;
