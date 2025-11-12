package com.platform.software.common.model;

import com.fasterxml.jackson.annotation.JsonIgnore;


/**
 * WARNING!:  Model mapping should not have been introduced as a generic way to map models and DTOs.
 * This is a logic that cannot be made generic and can become extremely convoluted and bug prone.
 * Please do your DTO mapping as part of your business logic.
 * If You are going use this approach, only do a "shallow" mapping and strictly avoid mapping nested entities.
 */
public interface ModelMapper<T> {

    /**
     * @deprecated This is an invalid use of DTO. A DTO is meant to be simple data structure that handles data transformations.
     * Not a factory that creates JPA Entities.
     */
    @Deprecated
    @JsonIgnore
    T getModel();

    /**
     * Warning! Only map shallowly. Any nested mappings should be handled at the business logic level not inside a DTO.
     *
     * @param dao The JPA entity to be mapped.
     * @return Return above DAO
     */
    T mapToModel(T dao);

    /**
     * Warning! Only map shallowly. Any nested mappings should be handled at the business logic level not inside a DTO.
     *
     * @param dao The JPA entity to be mapped from.
     */
    void mapToSelf(T dao);
}
