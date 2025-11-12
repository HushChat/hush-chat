package com.platform.software.config.swagger;

import com.platform.software.common.constants.Constants;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.models.media.IntegerSchema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.Parameter;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Profile("!test")
public class SwaggerUIConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/swagger-ui/");
    }

    @Bean
    public OpenApiCustomizer openApiCustomizer() {
        return openApi -> {
            openApi.getPaths().values().forEach(pathItem -> {
                pathItem.readOperations().forEach(operation -> {
                    operation.addParametersItem(new Parameter()
                            .name(Constants.X_TENANT_HEADER)
                            .in(String.valueOf(ParameterIn.HEADER))
                            .required(true)
                            .schema(new StringSchema()._default(Constants.DEFAULT_TEST_TENANT_ID))
                            .description("tenant header for all requests"));

                    boolean removedPaginatedParams = operation.getParameters().removeIf(param ->
                            param.getSchema() != null &&
                                    param.getSchema().get$ref() != null &&
                                    param.getSchema().get$ref().contains("Pageable"));
                    if (removedPaginatedParams) {
                        // Add individual pagination parameters
                        operation.addParametersItem(new Parameter()
                                .name("page")
                                .in(String.valueOf(ParameterIn.QUERY))
                                .required(false)
                                .schema(new IntegerSchema()._default(0))
                                .description("Page number (0-based)"));

                        operation.addParametersItem(new Parameter()
                                .name("size")
                                .in(String.valueOf(ParameterIn.QUERY))
                                .required(false)
                                .schema(new IntegerSchema()._default(100))
                                .description("Page size"));
                    }

                    operation.getParameters().removeIf(parameter ->
                            "userDetails".equals(parameter.getName()) ||
                                    parameter.getExtensions() != null &&
                                            parameter.getExtensions().containsKey("x-authenticated-user"));
                });
            });
        };
    }
}
