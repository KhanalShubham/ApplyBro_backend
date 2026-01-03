import NepalCollege from '../../models/nepalCollege.model.js';
import Course from '../../models/course.model.js';
import ForeignUniversity from '../../models/foreignUniversity.model.js';
import CreditMapping from '../../models/creditMapping.model.js';
import CreditTransferRequest from '../../models/creditTransferRequest.model.js';

/**
 * Get all Nepal colleges
 */
export const getNepalColleges = async (req, res) => {
    try {
        const colleges = await NepalCollege.find({ isActive: true })
            .select('name affiliation location programs')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: colleges
        });
    } catch (error) {
        console.error('Error fetching Nepal colleges:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch colleges',
            error: error.message
        });
    }
};

/**
 * Get programs for a specific college
 */
export const getCollegePrograms = async (req, res) => {
    try {
        const { collegeId } = req.params;

        const college = await NepalCollege.findById(collegeId).select('programs');

        if (!college) {
            return res.status(404).json({
                success: false,
                message: 'College not found'
            });
        }

        res.status(200).json({
            success: true,
            data: college.programs || []
        });
    } catch (error) {
        console.error('Error fetching college programs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch programs',
            error: error.message
        });
    }
};

/**
 * Get courses for a specific college and program
 */
export const getCourses = async (req, res) => {
    try {
        const { collegeId } = req.params;
        const { programName } = req.query;

        const query = { collegeId, isActive: true };
        if (programName) {
            query.programName = programName;
        }

        const courses = await Course.find(query)
            .select('courseName courseCode creditValue semester year programName')
            .sort({ year: 1, semester: 1 });

        res.status(200).json({
            success: true,
            data: courses
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch courses',
            error: error.message
        });
    }
};

/**
 * Find matching universities based on credit transfer criteria
 */
export const findMatchingUniversities = async (req, res) => {
    try {
        const {
            collegeId,
            programName,
            creditsCompleted,
            preferredCountries,
            currentYear
        } = req.body;

        // Validate required fields
        if (!collegeId || !programName || !creditsCompleted) {
            return res.status(400).json({
                success: false,
                message: 'College, program, and credits completed are required'
            });
        }

        // Get courses for the student's program
        const courses = await Course.find({
            collegeId,
            programName,
            isActive: true
        }).select('_id courseName creditValue');

        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No courses found for this program'
            });
        }

        const courseIds = courses.map(c => c._id);

        // Build query for foreign universities
        const universityQuery = {
            isActive: true,
            acceptsCreditTransfer: true
        };

        if (preferredCountries && preferredCountries.length > 0) {
            universityQuery.country = { $in: preferredCountries };
        }

        // Get all matching universities
        const universities = await ForeignUniversity.find(universityQuery)
            .select('name country city programName totalCredits duration tuitionRange entryRequirements website imageUrl isVerified');

        // For each university, calculate credit transfer potential
        const results = await Promise.all(
            universities.map(async (university) => {
                // Get credit mappings for this university and the student's courses
                const mappings = await CreditMapping.find({
                    localCourseId: { $in: courseIds },
                    foreignUniversityId: university._id,
                    isActive: true
                })
                    .populate('localCourseId', 'courseName creditValue')
                    .lean();

                // Calculate total transferable credits
                let totalTransferable = 0;
                let fullAcceptance = 0;
                let partialAcceptance = 0;
                let noAcceptance = 0;

                const creditBreakdown = mappings.map(mapping => {
                    if (mapping.acceptanceStatus === 'full') {
                        totalTransferable += mapping.creditsTransferred || mapping.localCourseId.creditValue;
                        fullAcceptance++;
                    } else if (mapping.acceptanceStatus === 'partial') {
                        totalTransferable += mapping.creditsTransferred || 0;
                        partialAcceptance++;
                    } else {
                        noAcceptance++;
                    }

                    return {
                        courseName: mapping.localCourseId.courseName,
                        creditValue: mapping.localCourseId.creditValue,
                        acceptanceStatus: mapping.acceptanceStatus,
                        creditsTransferred: mapping.creditsTransferred,
                        equivalentCourseName: mapping.equivalentCourseName,
                        verificationStatus: mapping.verificationStatus
                    };
                });

                // Calculate remaining duration
                const remainingCredits = university.totalCredits - totalTransferable;
                const remainingSemesters = university.duration?.semesters
                    ? Math.ceil((remainingCredits / university.totalCredits) * university.duration.semesters)
                    : null;

                // Calculate match score (0-100)
                const matchScore = mappings.length > 0
                    ? Math.round((totalTransferable / creditsCompleted) * 100)
                    : 0;

                return {
                    university: {
                        _id: university._id,
                        name: university.name,
                        country: university.country,
                        city: university.city,
                        programName: university.programName,
                        totalCredits: university.totalCredits,
                        duration: university.duration,
                        tuitionRange: university.tuitionRange,
                        entryRequirements: university.entryRequirements,
                        website: university.website,
                        imageUrl: university.imageUrl,
                        isVerified: university.isVerified
                    },
                    creditTransfer: {
                        totalTransferable,
                        remainingCredits,
                        remainingSemesters,
                        acceptanceBreakdown: {
                            full: fullAcceptance,
                            partial: partialAcceptance,
                            none: noAcceptance
                        },
                        matchScore,
                        creditBreakdown
                    }
                };
            })
        );

        // Filter out universities with no credit mappings and sort by match score
        const filteredResults = results
            .filter(r => r.creditTransfer.matchScore > 0)
            .sort((a, b) => b.creditTransfer.matchScore - a.creditTransfer.matchScore);

        res.status(200).json({
            success: true,
            data: {
                totalMatches: filteredResults.length,
                universities: filteredResults
            }
        });
    } catch (error) {
        console.error('Error finding matching universities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to find matching universities',
            error: error.message
        });
    }
};

/**
 * Get detailed credit mapping for a specific university
 */
export const getCreditMapping = async (req, res) => {
    try {
        const { universityId } = req.params;
        const { collegeId, programName } = req.query;

        if (!collegeId || !programName) {
            return res.status(400).json({
                success: false,
                message: 'College and program are required'
            });
        }

        // Get courses for the program
        const courses = await Course.find({
            collegeId,
            programName,
            isActive: true
        }).select('_id courseName creditValue semester year');

        const courseIds = courses.map(c => c._id);

        // Get credit mappings
        const mappings = await CreditMapping.find({
            localCourseId: { $in: courseIds },
            foreignUniversityId: universityId,
            isActive: true
        })
            .populate('localCourseId', 'courseName creditValue semester year')
            .populate('foreignUniversityId', 'name programName')
            .lean();

        res.status(200).json({
            success: true,
            data: mappings
        });
    } catch (error) {
        console.error('Error fetching credit mapping:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch credit mapping',
            error: error.message
        });
    }
};

/**
 * Save a credit transfer request
 */
export const saveCreditTransferRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            currentCollege,
            currentProgram,
            currentYear,
            currentSemester,
            creditsCompleted,
            preferredCountries,
            transcriptUrl,
            syllabusUrl,
            savedUniversities
        } = req.body;

        // Check if user already has a request
        let request = await CreditTransferRequest.findOne({ userId });

        if (request) {
            // Update existing request
            request.currentCollege = currentCollege;
            request.currentProgram = currentProgram;
            request.currentYear = currentYear;
            request.currentSemester = currentSemester;
            request.creditsCompleted = creditsCompleted;
            request.preferredCountries = preferredCountries;
            request.transcriptUrl = transcriptUrl;
            request.syllabusUrl = syllabusUrl;
            request.savedUniversities = savedUniversities;

            await request.save();
        } else {
            // Create new request
            request = await CreditTransferRequest.create({
                userId,
                currentCollege,
                currentProgram,
                currentYear,
                currentSemester,
                creditsCompleted,
                preferredCountries,
                transcriptUrl,
                syllabusUrl,
                savedUniversities
            });
        }

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('Error saving credit transfer request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save request',
            error: error.message
        });
    }
};

/**
 * Get user's credit transfer request
 */
export const getUserCreditTransferRequest = async (req, res) => {
    try {
        const userId = req.user._id;

        const request = await CreditTransferRequest.findOne({ userId })
            .populate('currentCollege', 'name affiliation')
            .populate('savedUniversities', 'name country programName');

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('Error fetching credit transfer request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch request',
            error: error.message
        });
    }
};

/**
 * Toggle saved university in credit transfer request
 */
export const toggleSavedUniversity = async (req, res) => {
    try {
        const userId = req.user._id;
        const { universityId } = req.body;

        let request = await CreditTransferRequest.findOne({ userId });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'No credit transfer request found'
            });
        }

        const index = request.savedUniversities.indexOf(universityId);

        if (index > -1) {
            // Remove from saved
            request.savedUniversities.splice(index, 1);
        } else {
            // Add to saved
            request.savedUniversities.push(universityId);
        }

        await request.save();

        res.status(200).json({
            success: true,
            data: request.savedUniversities
        });
    } catch (error) {
        console.error('Error toggling saved university:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update saved universities',
            error: error.message
        });
    }
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * Admin: Get all foreign universities
 */
export const getAllUniversities = async (req, res) => {
    try {
        const universities = await ForeignUniversity.find()
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: universities
        });
    } catch (error) {
        console.error('Error fetching universities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch universities',
            error: error.message
        });
    }
};

/**
 * Admin: Create a new college
 */
export const createCollege = async (req, res) => {
    try {
        const collegeData = req.body;
        const college = await NepalCollege.create(collegeData);

        res.status(201).json({
            success: true,
            data: college,
            message: 'College created successfully'
        });
    } catch (error) {
        console.error('Error creating college:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create college',
            error: error.message
        });
    }
};

/**
 * Admin: Update a college
 */
export const updateCollege = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const college = await NepalCollege.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!college) {
            return res.status(404).json({
                success: false,
                message: 'College not found'
            });
        }

        res.status(200).json({
            success: true,
            data: college,
            message: 'College updated successfully'
        });
    } catch (error) {
        console.error('Error updating college:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update college',
            error: error.message
        });
    }
};

/**
 * Admin: Delete a college
 */
export const deleteCollege = async (req, res) => {
    try {
        const { id } = req.params;

        const college = await NepalCollege.findByIdAndDelete(id);

        if (!college) {
            return res.status(404).json({
                success: false,
                message: 'College not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'College deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting college:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete college',
            error: error.message
        });
    }
};

/**
 * Admin: Create a new foreign university
 */
export const createUniversity = async (req, res) => {
    try {
        const universityData = req.body;
        const university = await ForeignUniversity.create(universityData);

        res.status(201).json({
            success: true,
            data: university,
            message: 'University created successfully'
        });
    } catch (error) {
        console.error('Error creating university:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create university',
            error: error.message
        });
    }
};

/**
 * Admin: Update a foreign university
 */
export const updateUniversity = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const university = await ForeignUniversity.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!university) {
            return res.status(404).json({
                success: false,
                message: 'University not found'
            });
        }

        res.status(200).json({
            success: true,
            data: university,
            message: 'University updated successfully'
        });
    } catch (error) {
        console.error('Error updating university:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update university',
            error: error.message
        });
    }
};

/**
 * Admin: Delete a foreign university
 */
export const deleteUniversity = async (req, res) => {
    try {
        const { id } = req.params;

        const university = await ForeignUniversity.findByIdAndDelete(id);

        if (!university) {
            return res.status(404).json({
                success: false,
                message: 'University not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'University deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting university:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete university',
            error: error.message
        });
    }
};
