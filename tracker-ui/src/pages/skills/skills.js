// CREATED WITH GPT 4.0

import React, { useState, useEffect, useMemo } from 'react';
import NavBar from '../../components/NavBar';
import SkillTable from '../../components/SkillComponents/SkillTable';
import AddSkillModal from '../../components/SkillComponents/AddSkillModal';
import EditSkillModal from '../../components/SkillComponents/EditSkillModal';
import DeleteSkillModal from '../../components/SkillComponents/DeleteSkillModal';

// Assuming './skills.css' and NavBar, SkillTable, AddSkillModal, EditSkillModal, DeleteSkillModal are correctly implemented
import './skills.css';

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [contacts, setContacts] = useState([]); // Assuming contacts are needed for reference in Add/Edit Modals
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [mostPopularSkill, setMostPopularSkill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Remove the sortOption state if it's not used elsewhere for a different purpose.
  const [sortCriteria, setSortCriteria] = useState({ field: 'name', order: 'asc' });
  const [filterRating, setFilterRating] = useState('');
  const [isLoadingPopularSkill, setIsLoadingPopularSkill] = useState(false);


  // Combined fetch function for skills and contacts
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      let queryParams = new URLSearchParams();
  
      if (searchTerm) queryParams.append('search', searchTerm);
      if (filterRating) queryParams.append('minRating', filterRating);
  
      const response = await fetch(`/skills?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error('Failed to fetch data');
  
      const skillsData = await response.json();
      setSkills(skillsData);
    } catch (error) {
      setError('Failed to load data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Inside your SkillsPage component
  const sortedSkills = useMemo(() => {
    return [...skills].sort((a, b) => {
      const field = sortCriteria.field;
      const order = sortCriteria.order;
  
      // Handling null or undefined for 'a'
      if (a[field] == null) return order === 'asc' ? 1 : -1;
      // Handling null or undefined for 'b'
      if (b[field] == null) return order === 'asc' ? -1 : 1;
  
      let compareResult = 0;
  
      // Numeric comparison
      if (field === 'rating' || typeof a[field] === 'number') {
        compareResult = a[field] - b[field];
      } else {
        // String comparison using localeCompare
        compareResult = a[field].localeCompare(b[field]);
      }
  
      // Reverse the comparison result if order is 'desc'
      return order === 'asc' ? compareResult : -compareResult;
    });
  }, [skills, sortCriteria]);
  
  

  

  // Add a function to update sort criteria based on column click
  const handleSortChange = (field) => {
    // Example of updating sort criteria state
    console.log('Sort was called on ', field)
    setSortCriteria(prevState => ({
      ...prevState,
      field: field,
      order: prevState.field === field && prevState.order === 'asc' ? 'desc' : 'asc',
    }));
  };
  

  // Correctly define fetchMostPopularSkill within SkillsPage component
  const fetchMostPopularSkill = async () => {
    setIsLoadingPopularSkill(true); // Assume you have a separate loading state for this operation
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/skills/popular', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        // If the server response is not ok, throw an error with the status text
        throw new Error(`Failed to fetch the most popular skill: ${response.statusText}`);
      }
  
      const data = await response.json();
      // Assuming the backend sends the most popular skill in the expected format
      // directly set the received data to your state
      setMostPopularSkill(data);
    } catch (error) {
      // Catch any errors that occur during the fetch operation
      setError(`Failed to load the most popular skill: ${error.message}`);
    } finally {
      // Whether successful or not, indicate that loading is complete
      setIsLoadingPopularSkill(false);
    }
  };
  

  useEffect(() => {
    fetchData();
    fetchMostPopularSkill();
  }, [searchTerm, filterRating]); // Removed sortCriteria from dependencies
  

  //useEffect(() => {
    //fetchMostPopularSkill();
  //});

  // Add skill
const addSkill = async (skill) => {
  setIsLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/skills', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skill),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add the skill');
    }

    // Refetch skills to update the list
    fetchData();
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

// Edit skill
const editSkill = async (skill) => {
  setIsLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/skills/${skill._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skill),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update the skill');
    }

    // Refetch skills to update the list
    fetchData();
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

// Delete skill
const deleteSkill = async (skillId) => {
  setIsLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/skills/${skillId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete the skill');
    }

    // Refetch skills to update the list
    fetchData();
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

  // Render part remains largely unchanged
  return (
    <div id="skillsPage">
      <NavBar />
      <div className="skills-container">
        <h1 id="skillsHeader">Skills</h1>
        {/* Displaying the most popular skill summary */}
        {mostPopularSkill ? (
        <div className="most-popular-skill-summary">
          <p>Most Popular Skill: {mostPopularSkill._id}</p>
          <p>Average Rating: {mostPopularSkill.averageRating.toFixed(1)}</p>
        </div>
      ) : isLoading ? (
        <p>Loading most popular skill...</p>
      ) : null}
        <button id="addSkillButton" onClick={() => setShowAddModal(true)}>Add New Skill</button>
        <div className="filters">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="number"
            placeholder="Filter by minimum rating..."
            value={filterRating}
            min="1" // Ensures the minimum value that can be entered is 1
            max="5" // Ensures the maximum value that can be entered is 5
            onChange={(e) => {
              const newValue = e.target.value;
              // Check if the new value is within the range 1 to 5
              if (newValue === '' || (newValue >= 1 && newValue <= 5)) {
                setFilterRating(newValue);
              }
            }}
          />
        </div>
        <SkillTable
          skills={sortedSkills} // Use sortedSkills here
          onEdit={setCurrentSkillAndShowEditModal}
          onDelete={setCurrentSkillAndShowDeleteModal}
          onSort={handleSortChange}
        />
        {showAddModal && <AddSkillModal onClose={() => setShowAddModal(false)} onSave={addSkill} contacts={contacts} />}
        {showEditModal && currentSkill && <EditSkillModal skill={currentSkill} onClose={() => setShowEditModal(false)} onSave={editSkill} contacts={contacts} />}
        {showDeleteModal && currentSkill && <DeleteSkillModal skill={currentSkill} onClose={() => setShowDeleteModal(false)} onDelete={deleteSkill} />}
      </div>
    </div>
  );

  // Helper function to set current skill and show edit modal
  function setCurrentSkillAndShowEditModal(skill) {
    setCurrentSkill(skill);
    setShowEditModal(true);
  }

  // Function to set current skill and show delete modal
  function setCurrentSkillAndShowDeleteModal(skillId) {
    // Find the skill object from the skills array using the skillId
    const skillToDelete = skills.find(skill => skill._id === skillId);
    if (skillToDelete) {
      setCurrentSkill(skillToDelete); // Set this skill as the currentSkill state
      setShowDeleteModal(true); // Set showDeleteModal state to true to show the modal
    }
}

};

export default SkillsPage;

