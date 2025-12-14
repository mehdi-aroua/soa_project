/**
 * SOAP Client for Course Service
 * Makes direct SOAP/XML requests to the course-service
 */

const SOAP_URL = '/course-service';
const NAMESPACE = 'http://course.university.com/';

/**
 * Creates a SOAP envelope for a given method and parameters
 */
const createSoapEnvelope = (method, params = {}) => {
    let paramsXml = '';
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
            paramsXml += `<${key}>${value}</${key}>`;
        }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:cour="${NAMESPACE}">
   <soapenv:Header/>
   <soapenv:Body>
      <cour:${method}>
         ${paramsXml}
      </cour:${method}>
   </soapenv:Body>
</soapenv:Envelope>`;
};

/**
 * Makes a SOAP request to the course service
 */
const soapRequest = async (method, params = {}) => {
    const envelope = createSoapEnvelope(method, params);

    try {
        const response = await fetch(SOAP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': '',
            },
            body: envelope,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('SOAP HTTP Error:', response.status, errorText);
            throw new Error(`SOAP request failed: ${response.status} - ${errorText}`);
        }

        const xmlText = await response.text();
        console.log(`SOAP Response for ${method}:`, xmlText);
        return parseXmlResponse(xmlText, method);
    } catch (error) {
        console.error(`SOAP Error for ${method}:`, error);
        throw error;
    }
};

/**
 * Parses XML response and extracts data
 */
const parseXmlResponse = (xmlText, method) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for SOAP fault
    const fault = xmlDoc.getElementsByTagName('S:Fault')[0] ||
        xmlDoc.getElementsByTagName('soap:Fault')[0] ||
        xmlDoc.getElementsByTagName('Fault')[0];
    if (fault) {
        const faultString = fault.getElementsByTagName('faultstring')[0]?.textContent ||
            fault.getElementsByTagName('detail')[0]?.textContent ||
            'SOAP Fault';
        throw new Error(faultString);
    }

    // For methods that return strings (add, update, delete, enroll, unenroll)
    if (['addCourse', 'updateCourse', 'deleteCourse', 'enrollStudent', 'unenrollStudent'].includes(method)) {
        // Try to find return element with string content
        const returnElements = xmlDoc.getElementsByTagName('return');
        if (returnElements.length > 0) {
            return returnElements[0].textContent;
        }
        // Try to find the method response element
        const responseTag = `${method}Response`;
        const responseElement = xmlDoc.getElementsByTagNameNS(NAMESPACE, responseTag)[0] ||
            xmlDoc.querySelector(`[*|${responseTag}]`);
        if (responseElement) {
            const returnEl = responseElement.getElementsByTagName('return')[0];
            return returnEl ? returnEl.textContent : responseElement.textContent;
        }
        // Fallback: return the entire response text
        return xmlText;
    }

    // For methods that return objects or arrays
    const responseTag = `${method}Response`;
    const responseElement = xmlDoc.getElementsByTagNameNS(NAMESPACE, responseTag)[0] ||
        xmlDoc.querySelector(`[*|${responseTag}]`) ||
        xmlDoc.querySelector(`${responseTag}`); // Fallback without namespace

    if (!responseElement) {
        // Try to find return elements directly in the body
        const body = xmlDoc.getElementsByTagName('Body')[0] ||
            xmlDoc.getElementsByTagName('S:Body')[0] ||
            xmlDoc.getElementsByTagName('soap:Body')[0];
        if (body) {
            return extractReturnData(body);
        }
        return extractReturnData(xmlDoc);
    }

    return extractReturnData(responseElement);
};

/**
 * Extracts return data from XML element
 */
const extractReturnData = (element) => {
    const returnElements = element.getElementsByTagName('return');

    if (returnElements.length === 0) {
        // Check for simple string response
        const textContent = element.textContent?.trim();
        if (textContent && textContent !== '') {
            return textContent;
        }
        return null;
    }

    if (returnElements.length === 1) {
        const returnEl = returnElements[0];
        // Check if it's a simple value or an object
        if (returnEl.children.length === 0) {
            return returnEl.textContent;
        }
        // Check if it's a Course object
        if (returnEl.getElementsByTagName('id').length > 0) {
            return parseCourseElement(returnEl);
        }
        // Other object types could be handled here
        return returnEl.textContent;
    }

    // Multiple return elements = array
    const results = [];
    for (const returnEl of returnElements) {
        if (returnEl.children.length === 0) {
            // Simple value
            results.push(returnEl.textContent);
        } else {
            // Object (likely Course)
            results.push(parseCourseElement(returnEl));
        }
    }
    return results;
};

/**
 * Parses a course XML element into a JavaScript object
 */
const parseCourseElement = (element) => {
    const course = {};

    const fields = ['id', 'code', 'name', 'description', 'credits', 'hours',
        'filiere', 'niveau', 'enseignantId', 'salle'];

    for (const field of fields) {
        const fieldEl = element.getElementsByTagName(field)[0];
        if (fieldEl) {
            const value = fieldEl.textContent;
            // Convert numeric fields
            if (['id', 'credits', 'hours', 'enseignantId'].includes(field)) {
                course[field] = parseInt(value, 10) || 0;
            } else {
                course[field] = value;
            }
        }
    }

    // Map 'name' to 'nom' for frontend compatibility
    if (course.name) {
        course.nom = course.name;
    }
    if (course.hours) {
        course.heures = course.hours;
    }

    return course;
};

/**
 * SOAP Course Service API
 */
const soapCourseService = {
    // Get all courses
    getAllCourses: async () => {
        const result = await soapRequest('getAllCourses');
        return Array.isArray(result) ? result : result ? [result] : [];
    },

    // Get course by ID
    getCourseById: async (id) => {
        return await soapRequest('getCourse', { id });
    },

    // Create new course
    createCourse: async (courseData) => {
        return await soapRequest('addCourse', {
            id: courseData.id,
            code: courseData.code,
            name: courseData.nom || courseData.name,
            description: courseData.description || '',
            credits: courseData.credits,
            hours: courseData.heures || courseData.hours,
            filiere: courseData.filiere,
            niveau: courseData.niveau,
            enseignantId: courseData.enseignantId || 0,
            salle: courseData.salle || '',
        });
    },

    // Update course
    updateCourse: async (id, courseData) => {
        return await soapRequest('updateCourse', {
            id,
            code: courseData.code,
            name: courseData.nom || courseData.name,
            description: courseData.description || '',
            credits: courseData.credits,
            hours: courseData.heures || courseData.hours,
            filiere: courseData.filiere,
            niveau: courseData.niveau,
            enseignantId: courseData.enseignantId || 0,
            salle: courseData.salle || '',
        });
    },

    // Delete course
    deleteCourse: async (id) => {
        return await soapRequest('deleteCourse', { id });
    },

    // Search/filter courses
    searchCourses: async (filters = {}) => {
        const result = await soapRequest('listCoursesFiltered', {
            filiere: filters.filiere || '',
            niveau: filters.niveau || '',
            code: filters.code || '',
            name: filters.name || '',
        });
        return Array.isArray(result) ? result : result ? [result] : [];
    },

    // Enroll student
    enrollStudent: async (courseId, studentId) => {
        return await soapRequest('enrollStudent', { courseId, studentId });
    },

    // Get enrolled students
    getEnrolledStudents: async (courseId) => {
        return await soapRequest('getEnrolledStudents', { courseId });
    },

    // Unenroll student
    unenrollStudent: async (courseId, studentId) => {
        return await soapRequest('unenrollStudent', { courseId, studentId });
    },
};

export default soapCourseService;
