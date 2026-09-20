package com.aprovaenem.notification.infrastructure.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String AUTH_EXCHANGE = "auth.events";
    public static final String NOTIFICATION_EXCHANGE = "notification.events";

    public static final String NOTIFICATION_AUTH_QUEUE = "notification.auth.queue";
    public static final String NOTIFICATION_REMINDERS_QUEUE = "notification.reminders.queue";

    public static final String USER_REGISTERED_ROUTING_KEY = "user.registered";
    public static final String EMAIL_VERIFICATION_ROUTING_KEY = "auth.email_verification";
    public static final String STUDY_REMINDER_ROUTING_KEY = "notification.reminder.study";

    @Bean
    public TopicExchange authExchange() {
        return new TopicExchange(AUTH_EXCHANGE, true, false);
    }

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE, true, false);
    }

    @Bean
    public Queue notificationAuthQueue() {
        return QueueBuilder.durable(NOTIFICATION_AUTH_QUEUE).build();
    }

    @Bean
    public Queue notificationRemindersQueue() {
        return QueueBuilder.durable(NOTIFICATION_REMINDERS_QUEUE).build();
    }

    @Bean
    public Binding bindingUserRegistered(Queue notificationAuthQueue, TopicExchange authExchange) {
        return BindingBuilder.bind(notificationAuthQueue).to(authExchange).with(USER_REGISTERED_ROUTING_KEY);
    }

    @Bean
    public Binding bindingEmailVerification(Queue notificationAuthQueue, TopicExchange authExchange) {
        return BindingBuilder.bind(notificationAuthQueue).to(authExchange).with(EMAIL_VERIFICATION_ROUTING_KEY);
    }

    @Bean
    public Binding bindingStudyReminder(Queue notificationRemindersQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(notificationRemindersQueue).to(notificationExchange).with(STUDY_REMINDER_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter jsonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter);
        return factory;
    }
}
