package com.sqrc.module.backendsqrc.logs.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

/**
 * Configuración del DataSource secundario para la base de datos de logs.
 * Esta configuración permite tener una conexión separada para el almacenamiento
 * de logs de auditoría, workflow y errores.
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        basePackages = "com.sqrc.module.backendsqrc.logs.repository",
        entityManagerFactoryRef = "logsEntityManagerFactory",
        transactionManagerRef = "logsTransactionManager"
)
public class LogsDataSourceConfig {

    /**
     * Propiedades del DataSource de logs desde application.properties
     */
    @Bean
    @ConfigurationProperties("logs.datasource")
    public DataSourceProperties logsDataSourceProperties() {
        return new DataSourceProperties();
    }

    /**
     * DataSource para la base de datos de logs
     */
    @Bean(name = "logsDataSource")
    public DataSource logsDataSource() {
        return logsDataSourceProperties()
                .initializeDataSourceBuilder()
                .build();
    }

    /**
     * EntityManagerFactory para las entidades de logs
     */
    @Bean(name = "logsEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean logsEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("logsDataSource") DataSource dataSource) {
        
        Map<String, Object> properties = new HashMap<>();
        properties.put("hibernate.hbm2ddl.auto", "update");
        properties.put("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
        properties.put("hibernate.show_sql", "false");
        properties.put("hibernate.format_sql", "false");
        
        return builder
                .dataSource(dataSource)
                .packages("com.sqrc.module.backendsqrc.logs.model")
                .persistenceUnit("logs")
                .properties(properties)
                .build();
    }

    /**
     * TransactionManager para la base de datos de logs
     */
    @Bean(name = "logsTransactionManager")
    public PlatformTransactionManager logsTransactionManager(
            @Qualifier("logsEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
