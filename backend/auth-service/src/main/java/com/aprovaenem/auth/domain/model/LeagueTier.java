package com.aprovaenem.auth.domain.model;

public enum LeagueTier {
    BRONZE,
    SILVER,
    GOLD,
    DIAMOND;

    public LeagueTier getNextTier() {
        return switch (this) {
            case BRONZE -> SILVER;
            case SILVER -> GOLD;
            case GOLD -> DIAMOND;
            case DIAMOND -> DIAMOND;
        };
    }

    public LeagueTier getPreviousTier() {
        return switch (this) {
            case BRONZE -> BRONZE;
            case SILVER -> BRONZE;
            case GOLD -> SILVER;
            case DIAMOND -> GOLD;
        };
    }
}
