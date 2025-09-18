import express from 'express';
import Course from '../models/Course.js';
import Year from '../models/Year.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import PYQ from '../models/PYQ.js';
import College from '../models/College.js';
import Branch from '../models/Branch.js';
import Batch from '../models/Batch.js';

const router = express.Router();

// Course routes
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().populate('semesters');
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const course = new Course({
      name: req.body.name,
      code: req.body.name.toUpperCase().replace(/\s+/g, ''),
      duration: 4
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Year routes
router.get('/years', async (req, res) => {
  try {
    const years = await Year.find();
    res.json(years.map(y => ({ _id: y._id, name: y.year })));
  } catch (error) {
    console.error('Error fetching years:', error);
    res.status(500).json({ error: 'Failed to fetch years' });
  }
});

router.post('/years', async (req, res) => {
  try {
    const year = new Year(req.body);
    await year.save();
    res.status(201).json(year);
  } catch (error) {
    console.error('Error creating year:', error);
    res.status(500).json({ error: 'Failed to create year' });
  }
});

// Semester routes
router.get('/semesters', async (req, res) => {
  try {
    const semesters = await Semester.find().populate('course');
    res.json(semesters);
  } catch (error) {
    console.error('Error fetching semesters:', error);
    res.status(500).json({ error: 'Failed to fetch semesters' });
  }
});

router.post('/semesters', async (req, res) => {
  try {
    const semester = new Semester(req.body);
    await semester.save();
    res.status(201).json(semester);
  } catch (error) {
    console.error('Error creating semester:', error);
    res.status(500).json({ error: 'Failed to create semester' });
  }
});

// Subject routes
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find().populate('semester');
    res.json(subjects.map(s => ({ _id: s._id, name: s.name })));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const subject = new Subject({
      name: req.body.name,
      code: req.body.name.toUpperCase().replace(/\s+/g, ''),
      semester: null
    });
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// Additional routes for QP criteria
router.get('/colleges', async (req, res) => {
  try {
    const colleges = await College.find();
    res.json(colleges.map(c => c.name));
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

router.get('/programs', async (req, res) => {
  try {
    const programs = await PYQ.distinct('program');
    // Return default programs if no data found
    let programList = programs && programs.length > 0 ? programs : ['B.Tech', 'BCA', 'MCA', 'MBA', 'M.Tech'];
    res.json(programList.map(p => ({ _id: p, name: p })));
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

router.get('/branches', async (req, res) => {
  try {
    const branches = await Branch.find();
    res.json(branches.map(b => b.name));
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

router.get('/batches', async (req, res) => {
  try {
    const batches = await Batch.find();
    res.json(batches.map(b => b.name));
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

router.post('/colleges', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'College name is required' });
    const existing = await College.findOne({ name });
    if (existing) return res.status(400).json({ error: 'College already exists' });
    const college = new College({ name });
    await college.save();
    res.status(201).json(college);
  } catch (error) {
    console.error('Error creating college:', error);
    res.status(500).json({ error: 'Failed to create college' });
  }
});

router.post('/branches', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Branch name is required' });
    const existing = await Branch.findOne({ name });
    if (existing) return res.status(400).json({ error: 'Branch already exists' });
    const branch = new Branch({ name });
    await branch.save();
    res.status(201).json(branch);
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ error: 'Failed to create branch' });
  }
});

router.post('/batches', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Batch name is required' });
    const existing = await Batch.findOne({ name });
    if (existing) return res.status(400).json({ error: 'Batch already exists' });
    const batch = new Batch({ name });
    await batch.save();
    res.status(201).json(batch);
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ error: 'Failed to create batch' });
  }
});

export default router;
