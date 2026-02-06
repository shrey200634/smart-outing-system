package com.smartouting.outing_service.repository;

import com.smartouting.outing_service.model.Outing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OutingRepository extends JpaRepository<Outing, Long> {
    List<Outing> findByStudentId(String studentId);

    // Find all students who are OUT and their return time is BEFORE right now
    // (Keep your other methods like findByStudentId...)


    List<Outing> findByStatusAndReturnDateBefore(String status, LocalDateTime now);

    long countByStudentIdAndStatus(String studentId , String status );

}





