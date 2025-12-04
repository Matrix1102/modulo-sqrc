package com.sqrc.module.backendsqrc.plantillaRespuesta.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import org.springframework.ui.freemarker.FreeMarkerConfigurationFactoryBean;

@Configuration
public class FreeMakerConfig {

    @Bean
    @Primary //prioriza usar la configuracion declarada en la clase
    public FreeMarkerConfigurationFactoryBean getFreeMarkerConfiguration() {
        FreeMarkerConfigurationFactoryBean bean = new FreeMarkerConfigurationFactoryBean();
        // Esto es importante: le decimos que cargue templates desde el classpath
        // por si usas alguno fijo, pero permitiremos Strings en el servicio.
        bean.setTemplateLoaderPath("classpath:/templates/");

        //objeto que se guardara en el ioc container
        return bean;
    }
}
