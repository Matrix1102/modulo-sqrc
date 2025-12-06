package com.sqrc.module.backendsqrc.logs.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

/**
 * Configuración del DataSource primario para la base de datos principal (bd_sqrc).
 * Esta es la base de datos principal donde se almacenan las entidades del negocio.
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        basePackages = {
                "com.sqrc.module.backendsqrc.ticket.repository",
                "com.sqrc.module.backendsqrc.encuesta.repository",
                "com.sqrc.module.backendsqrc.vista360.repository",
                "com.sqrc.module.backendsqrc.baseDeConocimientos.repository",
                "com.sqrc.module.backendsqrc.reporte.repository",
                "com.sqrc.module.backendsqrc.plantillaRespuesta.Repository",
                "com.sqrc.module.backendsqrc.comunicacion.repository"
        },
        entityManagerFactoryRef = "primaryEntityManagerFactory",
        transactionManagerRef = "primaryTransactionManager"
)
public class PrimaryDataSourceConfig {

    /**
     * Propiedades del DataSource primario desde application.properties
     */
    @Primary
    @Bean
    @ConfigurationProperties("spring.datasource")
    public DataSourceProperties primaryDataSourceProperties() {
        return new DataSourceProperties();
    }

    /**
     * DataSource primario para la base de datos principal
     */
    @Primary
    @Bean(name = "primaryDataSource")
    public DataSource primaryDataSource() {
        return primaryDataSourceProperties()
                .initializeDataSourceBuilder()
                .build();
    }

    /**
     * EntityManagerFactory para las entidades del negocio
     */
    @Primary
    @Bean(name = "primaryEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean primaryEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("primaryDataSource") DataSource dataSource) {
        
        Map<String, Object> properties = new HashMap<>();
        properties.put("hibernate.hbm2ddl.auto", "update");
        properties.put("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
        properties.put("hibernate.show_sql", "true");
        properties.put("hibernate.format_sql", "true");
        
        return builder
                .dataSource(dataSource)
                .packages(
                        "com.sqrc.module.backendsqrc.ticket.model",
                        "com.sqrc.module.backendsqrc.encuesta.model",
                        "com.sqrc.module.backendsqrc.vista360.model",
                        "com.sqrc.module.backendsqrc.baseDeConocimientos.model",
                        "com.sqrc.module.backendsqrc.reporte.model",
                        "com.sqrc.module.backendsqrc.plantillaRespuesta.Model",
                        "com.sqrc.module.backendsqrc.comunicacion.model"
                )
                .persistenceUnit("primary")
                .properties(properties)
                .build();
    }

    /**
     * TransactionManager primario
     */
    @Primary
    @Bean(name = "primaryTransactionManager")
    public PlatformTransactionManager primaryTransactionManager(
            @Qualifier("primaryEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
