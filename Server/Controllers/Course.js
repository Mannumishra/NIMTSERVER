const course = require('../Model/Course');
const courseDetails = require('../Model/CourseDetails');
const { uploadImage, deleteImage } = require('../Utils/Cloudnary');
const mongoose = require("mongoose")

const createCourse = async (req, res) => {
    try {
        const { courseCtegory, courseName, courseTopic, courseDuration, showinHomePage, courseEnrollment } = req.body;
        const errorMessages = [];
        if (!courseCtegory) {
            errorMessages.push("Course Category ID is required.");
        }
        if (!courseName) {
            errorMessages.push("Course Name is required.");
        }
        if (!courseTopic || !Array.isArray(courseTopic) || courseTopic.length === 0) {
            errorMessages.push("At least one Course Topic is required.");
        }
        if (!courseDuration) {
            errorMessages.push("Course Duration is required.");
        }
        if (errorMessages.length > 0) {
            return res.status(400).json({ message: 'Validation errors', errors: errorMessages.join(",") });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required.' });
        }
        const folderName = 'NIMT';
        const imageUrl = await uploadImage(req.file.path, folderName);

        const upperCaseName = courseName.toUpperCase();
        const exitName = await course.findOne({ courseName: upperCaseName });
        if (exitName) {
            return res.status(400).json({
                success: false,
                message: "This course name already exists."
            });
        }

        const courseData = {
            courseCtegory,
            courseName: upperCaseName,
            courseTopic,
            courseDuration,
            courseEnrollment,
            image: imageUrl,
            showinHomePage: showinHomePage
        };

        const newCourse = new course(courseData);
        await newCourse.save();

        res.status(200).json({ message: 'Course created successfully!', data: newCourse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating course', error: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Request Body:", req.body); // Log the request body to debug
        const courseToUpdate = await course.findById(id);
        
        if (!courseToUpdate) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        // Prepare updated data
        const updatedData = {
            courseCtegory: req.body.courseCtegory,
            courseName: req.body.courseName,
            courseTopic: req.body.courseTopic,
            courseDuration: req.body.courseDuration,
            showinHomePage: req.body.showinHomePage
        };

        // Handle courseEnrollment with validation
        const enrollmentValue = req.body.courseEnrollment;
        if (enrollmentValue === null || enrollmentValue === '' || enrollmentValue === 'null') {
            updatedData.courseEnrollment = 0; // Set to 0 if not provided
        } else {
            const parsedValue = Number(enrollmentValue);
            if (!isNaN(parsedValue)) {
                updatedData.courseEnrollment = parsedValue;
            } else {
                return res.status(400).json({ message: 'Invalid course enrollment value.' });
            }
        }

        // Check if an image is uploaded
        if (req.file) {
            const folderName = 'NIMT';
            const imageUrl = await uploadImage(req.file.path, folderName);
            updatedData.image = imageUrl; // Update image URL
        }

        // Update the course with the new data
        await course.updateOne({ _id: id }, updatedData);

        res.status(200).json({ message: 'Course updated successfully!', data: updatedData });
    } catch (error) {
        console.error("Error during course update:", error); // Enhanced logging
        res.status(500).json({ message: 'Error updating course', error: error.message });
    }
};



// Other functions remain unchanged...

// Delete a course by ID
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await course.findById(id);

        const relatedRecord = await courseDetails.find({ courseName: id })
        // console.log(relatedRecord)
        if (relatedRecord.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This course name cannot be deleted because there are related course details."
            });
        }

        if (!data) {
            return res.status(404).json({ message: 'Course not found.' });
        }
        const publicId = data.image.split('/').pop().split('.')[0]; // Extract public ID from the image URL
        await deleteImage(publicId); // Delete image from Cloudinary

        await course.deleteOne(); // Pass the correct parameter to delete the course
        res.status(200).json({ message: 'Course deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
};

const getAllCourse = async (req, res) => {
    try {
        const data = await course.find().populate("courseCtegory")
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Record Not Found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Record Found Successfullt",
            data: data
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error creating course', error: error.message });
    }
}

const getCourseAfterDetails = async (req, res) => {
    try {
        const allCourseDetails = await courseDetails.find().populate('courseName');
        const data = await course.find().populate("courseCtegory");
        const filterData = data.filter(courseItem =>
            !allCourseDetails.some(courseDetail => courseDetail.courseName._id.equals(courseItem._id))
        );
        if (filterData.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No records found."
            });
        }

        // Respond with filtered data
        res.status(200).json({
            success: true,
            message: "Records found successfully.",
            data: filterData
        });
    } catch (error) {
        console.error(error); // Improved error logging
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}



const getSingleCourse = async (req, res) => {
    try {
        const { id } = req.params
        console.log(id)
        const data = await course.findById(id).populate("courseCtegory")
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Record Not Found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Record Found Successfullt",
            data: data
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error creating course', error: error.message });
    }
}


// const updateCourse = async (req, res) => {
//     try {
//         const { name } = req.params;
//         const upperCaseName = name.toUpperCase();
//         const courseToUpdate = await course.findOne({ courseName: upperCaseName });

//         if (!courseToUpdate) {
//             return res.status(404).json({ message: 'Course not found.' });
//         }

//         console.log(req.body)
//         // Validate courseCtegory field
//         if (req.body.courseCtegory) {
//             if (!mongoose.Types.ObjectId.isValid(req.body.courseCtegory)) {
//                 return res.status(400).json({ message: 'Invalid course category ID.' });
//             }
//         }

//         // Check if a new course name is provided and if it already exists
//         if (req.body.courseName) {
//             const newUpperCaseName = req.body.courseName.toUpperCase();
//             const existingCourse = await course.findOne({ courseName: newUpperCaseName });

//             // If an existing course is found and it's not the same course
//             if (existingCourse && existingCourse.courseName !== upperCaseName) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "This course name already exists."
//                 });
//             }
//         }

//         let imageUrl;
//         if (req.file) {
//             const publicId = courseToUpdate.image.split('/').pop().split('.')[0]; // Extract public ID from the old image URL
//             await deleteImage(publicId); // Delete old image from Cloudinary

//             const folderName = 'NIMT';
//             imageUrl = await uploadImage(req.file.path, folderName);
//         } else {
//             imageUrl = courseToUpdate.image; // Retain the old image if no new image is uploaded
//         }

//         // Update the course data
//         const updatedData = {
//             ...req.body,
//             courseName: upperCaseName,
//             image: imageUrl
//         };

//         console.log('Updated Data:', updatedData); // Log the updated data for debugging

//         await course.updateOne({ courseName: upperCaseName }, updatedData); // Update the course with new data

//         res.status(200).json({ message: 'Course updated successfully!', data: updatedData });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error updating course', error: error.message });
//     }
// };



// // Delete a course by ID
// const deleteCourse = async (req, res) => {
//     try {
//         const { name } = req.params;
//         const upperCaseName = name.toUpperCase()
//         const data = await course.findOne({ courseName: upperCaseName });
//         if (!data) {
//             return res.status(404).json({ message: 'Course not found.' });
//         }
//         const publicId = data.image.split('/').pop().split('.')[0]; // Extract public ID from the image URL
//         await deleteImage(publicId); // Delete image from Cloudinary

//         await course.deleteOne();
//         res.status(200).json({ message: 'Course deleted successfully!' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error deleting course', error: error.message });
//     }
// };

// Export the controller methods
module.exports = {
    createCourse,
    deleteCourse, getAllCourse, getSingleCourse, updateCourse, getCourseAfterDetails
};
