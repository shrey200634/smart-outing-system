package com.smartouting.outing_service.exception;

public class ResourseNotFoundException extends RuntimeException{
    public ResourseNotFoundException(String message ){
        super(message);
    }
}
