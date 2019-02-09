import Vue from "vue";
import Vuex from "vuex";
import Helpers from "./helpers";
import Constants from "./constants";

Vue.use(Vuex);

// Automatically persist state to localStorage
// import VuexPersistence from 'vuex-persist'
// const vuexLocal = new VuexPersistence({
//   storage: window.localStorage
// });

export default new Vuex.Store({
  state: {
    character: {
      level: 5,
      timesEnlightened: 0,
      extraSkillCredits: {
        "railrea": false,
        "oswald": false,
        "luminance1": false,
        "luminance2": false
      },
      attributes: {
        strength: {
          creation: 10,
          invested: 0,
          buff: 0,
          cantrip: 0
        },
        endurance: {
          creation: 10,
          invested: 0,
          buff: 0,
          cantrip: 0
        },
        coordination: {
          creation: 10,
          invested: 0,
          buff: 0,
          cantrip: 0
        },
        quickness: {
          creation: 10,
          invested: 0,
          buff: 0,
          cantrip: 0
        },
        focus: {
          creation: 10,
          invested: 0,
          buff: 0,
          cantrip: 0
        },
        self: {
          creation: 10,
          invested: 0,
          buff: 0,
          cantrip: 0
        }
      },
      vitals: {
        health: {
          invested: 0,
          buff: 0,
          cantrip: 0
        },
        stamina: {
          invested: 0,
          buff: 0,
          cantrip: 0
        },
        mana: {
          invested: 0,
          buff: 0,
          cantrip: 0
        }
      },
      skills: {
        alchemy: {
          training: Constants.TRAINING.UNTRAINED,
          invested: 0,
          buff: 0,
          cantrip: 0
        },
        arcane_lore: {
          training: Constants.TRAINING.TRAINED,
          invested: 0,
          buff: 0,
          cantrip: 0
        },
        melee_defense: {
          training: Constants.TRAINING.UNTRAINED,
          invested: 0,
          buff: 0,
          cantrip: 0
        },
        salvaging: {
          training: Constants.TRAINING.TRAINED,
          invested: 0,
          buff: 0,
          cantrip: 0
        }
      }
    }
  },
  getters: {
    // General
    exportedCharacter: state => {
      return JSON.stringify(state, null, 4);
    },

    totalXPEarned: (state, getters) => {
      let cost = 0;

      cost += Constants.COST_LEVEL[state.character.level];

      return cost;
    },

    totalXPEarned: (state, getters) => {
      let cost = 0;

      cost += Constants.COST_LEVEL[state.character.level];
      cost += state.character.timesEnlightened * Constants.COST_LEVEL["275"];

      return cost;
    },
    

    totalXPInvested: (state, getters) => {
      let cost = 0;

      Constants.ATTRIBUTES.forEach(a => {
        cost += Constants.COST_ATTRIBUTE[state.character.attributes[a].invested];
      });

      Constants.VITALS.forEach(v => {
        cost += Constants.COST_VITAL[state.character.vitals[v].invested];
      });

      getters.specializedSkills.forEach(s => {
        cost += Constants.COST_SKILL_SPECIALIZED[state.character.skills[s].invested];
      });

      getters.trainedSkills.forEach(s => {
        cost += Constants.COST_SKILL_TRAINED[state.character.skills[s].invested];
      });

      cost += state.character.timesEnlightened * Constants.COST_LEVEL["275"];

      return cost;
    },
    
    requiredLevel: (state, getters) => {
      for (var e = 0; e < 6; e++) {
        for (var i = 1; i <= 275; i++) {
          if (getters.totalXPInvested <= (Constants.COST_LEVEL[i] + e * Constants.COST_LEVEL[i])) {
            return i;
          }
        }
      }


      // We didn't find a solution which means we've Enlightened
      return -1;
    },

    skillPointsAvailable: state => {
      return Constants.SKILL_POINTS_AT_LEVEL[state.character.level] + 
        (state.character.extraSkillCredits.railrea ? 1 : 0) +
        (state.character.extraSkillCredits.oswald ? 1 : 0) +
        (state.character.extraSkillCredits.luminance1 ? 1 : 0) +
        (state.character.extraSkillCredits.luminance2 ? 1 : 0);
    },

    skillPointsSpent: state => {
      let cost = 0;

      Constants.SKILLS.forEach(skill => {
        let training = state.character.skills[skill].training;

        if (training == Constants.TRAINING.SPECIALIZED || training == Constants.TRAINING.TRAINED) {
          cost += Constants.COST_SKILL_POINTS[skill][training];
        }
      });
      
      return cost;
    },

    augmentationSpent: state => {
      let cost = 0;

      Object.keys(Constants.SPEC_COSTS_AUG).forEach(skill => {
        if (state.character.skills[skill] && state.character.skills[skill].training == Constants.TRAINING.SPECIALIZED && Constants.SPEC_COSTS_AUG[skill]) {
          cost += 1 ;
        }
      });
      
      return cost;
    },

    totalLuminanceXPSpent: state => {
      let cost = 0;

      Object.keys(Constants.SPEC_COSTS_AUG).forEach(skill => {
        if (state.character.skills[skill] && state.character.skills[skill].training == Constants.TRAINING.SPECIALIZED && Constants.SPEC_COSTS_AUG[skill]) {
          cost += 1000000000 ;
        }
      });

      // Enlightenment requires you get all lum auras (20mil xp)
      // TODO: Track auras and this together
      if (state.character.timesEnlightened > 0) {
        cost += 20000000;
      }
      
      return cost;
    },

    specializedSkillPointsSpent: (state, getters) => {
      let cost = 0;

      getters.specializedSkills.forEach(skill => {
        cost += Constants.COST_SKILL_POINTS[skill][state.character.skills[skill].training];
      });

      return cost;
    },

    // Attributes
    attributePointsSpent: state => {
      let spent = 0;
      
      Constants.ATTRIBUTES.forEach(attribute => {
        spent += state.character.attributes[attribute].creation;
      });

      return spent;
    },
    strengthBase: state => {
      return state.character.attributes.strength.creation + state.character.attributes.strength.invested;
    },
    strengthBuffed: (state, getters) => {
      return getters.strengthBase + 
        Helpers.buffBonus(state.character.attributes.strength.buff) +
        Helpers.cantripBonus(state.character.attributes.strength.cantrip);
    },
    enduranceBase: state => {
      return state.character.attributes.endurance.creation + state.character.attributes.endurance.invested;
    },
    enduranceBuffed: (state, getters) => {
      return getters.enduranceBase + Helpers.buffBonus(state.character.attributes.endurance.buff) +
      Helpers.cantripBonus(state.character.attributes.endurance.cantrip);
    },
    coordinationBase: state => {
      return state.character.attributes.coordination.creation + state.character.attributes.coordination.invested;
    },
    coordinationBuffed: (state, getters) => {
      return getters.coordinationBase + Helpers.buffBonus(state.character.attributes.coordination.buff) +
      Helpers.cantripBonus(state.character.attributes.coordination.cantrip);
    },
    quicknessBase: state => {
      return state.character.attributes.quickness.creation + state.character.attributes.quickness.invested;
    },
    quicknessBuffed: (state, getters) => {
      return getters.quicknessBase + Helpers.buffBonus(state.character.attributes.quickness.buff) +
      Helpers.cantripBonus(state.character.attributes.quickness.cantrip);
    },
    focusBase: state => {
      return state.character.attributes.focus.creation + state.character.attributes.focus.invested;
    },
    focusBuffed: (state, getters) => {
      return getters.focusBase + Helpers.buffBonus(state.character.attributes.focus.buff) +
      Helpers.cantripBonus(state.character.attributes.focus.cantrip);
    },
    selfBase: state => {
      return state.character.attributes.self.creation + state.character.attributes.self.invested;
    },
    selfBuffed: (state, getters) => {
      return getters.selfBase + Helpers.buffBonus(state.character.attributes.self.buff) +
      Helpers.cantripBonus(state.character.attributes.self.cantrip);
    },
    
    // Vitals
    healthCreation: state => {
      return Math.round(state.character.attributes.endurance.creation / 2);
    },
    healthBase: (state, getters) => {
      return Math.round(getters.enduranceBase / 2) + state.character.vitals.health.invested +
      Helpers.cantripBonus(state.character.vitals.health.cantrip);
    },
    healthBuffed: (state, getters) => {
      return getters.healthBase + Math.round(Helpers.buffBonus(state.character.vitals.health.buff) / 2);
    },
    staminaCreation: state => {
      return state.character.attributes.endurance.creation;
    },
    staminaBase: (state, getters)  => {
      return getters.enduranceBase + state.character.vitals.stamina.invested +
      Helpers.cantripBonus(state.character.vitals.stamina.cantrip);
    },
    staminaBuffed: (state, getters) => {
      return getters.staminaBase + Helpers.buffBonus(state.character.vitals.stamina.buff);
    },
    manaCreation: state => {
      return state.character.attributes.self.creation;
    },
    manaBase: (state, getters)  => {
      return getters.selfBase + state.character.vitals.mana.invested;
    },
    manaBuffed: (state, getters) => {
      return getters.manaBase + Helpers.buffBonus(state.character.vitals.mana.buff) +
      Helpers.cantripBonus(state.character.vitals.mana.cantrip);
    },
    
    // Skills
    alchemyBase: (state, getters) => {
      return Math.round((getters.coordinationBase + getters.focusBase) / 3) + 
        Helpers.trainingBonus(state.character.skills.alchemy.training) +
        state.character.timesEnlightened +
        state.character.skills.alchemy.invested;
    },
    alchemyBuffed: (state, getters) => {
      return getters.alchemyBase + 
        Helpers.buffBonus(state.character.skills.alchemy.buff) +
        Helpers.cantripBonus(state.character.skills.alchemy.cantrip) +
        Math.round((Helpers.buffBonus(state.character.attributes.coordination.buff) + Helpers.buffBonus(state.character.attributes.focus.buff)) /3);
    },
    arcane_loreBase: (state, getters) => {
      return Math.round(getters.focusBase / 3) + 
        Helpers.trainingBonus(state.character.skills.arcane_lore.training) + 
        state.character.timesEnlightened +
        state.character.skills.arcane_lore.invested;
    },
    arcane_loreBuffed: (state, getters) => {
      return getters.arcane_loreBase + 
        Helpers.buffBonus(state.character.skills.arcane_lore.buff) +
        Helpers.cantripBonus(state.character.skills.arcane_lore.cantrip) +
        Math.round(Helpers.buffBonus(state.character.attributes.focus.buff) /3);
    },
    melee_defenseBase: (state, getters) => {
      return Math.round((getters.coordinationBase + getters.quicknessBase / 3)) + 
        Helpers.trainingBonus(state.character.skills.melee_defense.training) + 
        state.character.timesEnlightened +
        state.character.skills.melee_defense.invested;
    },
    melee_defenseBuffed: (state, getters) => {
      return getters.melee_defenseBase + 
        Helpers.buffBonus(state.character.skills.melee_defense.buff) +
        Helpers.cantripBonus(state.character.skills.melee_defense.cantrip) +
        Math.round((Helpers.buffBonus(state.character.attributes.coordination.buff + Helpers.buffBonus(state.character.attributes.quickness.buff) / 3)));
    },
    salvagingBase: (state, getters) => {
      return Helpers.trainingBonus(state.character.skills.salvaging.training) + 
      state.character.timesEnlightened +
      state.character.skills.salvaging.invested;
    },
    salvagingBuffed: (state, getters) => {
      return getters.salvagingBase + 
        Helpers.buffBonus(state.character.skills.salvaging.buff) +
        Helpers.cantripBonus(state.character.skills.salvaging.cantrip);
    },

    specializedSkills: state => {
      return Object.keys(state.character.skills)
        .filter(key => state.character.skills[key].training === Constants.TRAINING.SPECIALIZED);
    },
    trainedSkills: state => {
      return Object.keys(state.character.skills)
        .filter(key => state.character.skills[key].training === Constants.TRAINING.TRAINED);
    },
    untrainedSkills: state => {
      return Object.keys(state.character.skills)
        .filter(key => state.character.skills[key].training === Constants.TRAINING.UNTRAINED);
    },
    unusableSkills: state => {
      return Object.keys(state.character.skills)
        .filter(key => state.character.skills[key].training === Constants.TRAINING.UNUSABLE);
    }
  },
  mutations: {
    updateLevel(state, value) {
      state.character.level = Number(value);
    },

    updateTimesEnlightened(state, value) {
      state.character.timesEnlightened = Number(value);
    },

    updateExtraSkillCredit(state, payload) {
      state.character.extraSkillCredits[payload.name] = payload.value;
    },

    updateAttributeCreation(state, payload) {
      let newVal = Number(payload.value);

      // Ensure we haven't spent more than 330 points and adjust other
      // attributes if needed
      let newSpent = Constants.ATTRIBUTES.map(a => {
        // Don't count old value for the attribute we're changing, use the new
        // value
        if (a === payload.name) {
          return newVal;
        } else {
          return state.character.attributes[a].creation;
        }
      }).reduce((a,v) => { 
        return a + v; 
      });

      // Use this to iterate over the other attributes we're lowering by name
      let names = Constants.ATTRIBUTES.filter(v => v !== payload.name);

      if (newSpent > 330) {
        let extra = newSpent - 330;

        for (var i = 0; i < extra; i++) {
          // Don't reduce attributes below 10. Adding 1 to `extra` ensures
          // we iterate long enough to lower everything as much as is needed
          if (state.character.attributes[names[i % 4]].creation <= 10) {
            extra += 1;
            continue;
          }

          state.character.attributes[names[i % 4]].creation -= 1;
        }
      }

      state.character.attributes[payload.name].creation = newVal;
    },

    updateAttributeInvested(state, payload) {
      state.character.attributes[payload.name].invested = Number(payload.value);
    },

    updateAttributeBuff(state, payload) {
      state.character.attributes[payload.name].buff = Number(payload.value);
    },

    updateAttributeCantrip(state, payload) {
      state.character.attributes[payload.name].cantrip = Number(payload.value);
    },

    updateVitalInvested(state, payload) {
      state.character.vitals[payload.name].invested = Number(payload.value);
    },

    updateVitalBuff(state, payload) {
      state.character.vitals[payload.name].buff = Number(payload.value);
    },

    updateVitalCantrip(state, payload) {
      state.character.vitals[payload.name].cantrip = Number(payload.value);
    },

    updateSkillInvestment(state, payload) {
      state.character.skills[payload.name].invested = Number(payload.value);
    },

    updateSkillBuff(state, payload) {
      state.character.skills[payload.name].buff = Number(payload.value);
    },

    updateSkillCantrip(state, payload) {
      state.character.skills[payload.name].cantrip = Number(payload.value);
    },

    increaseTraining(state, skill) {
      const currentTraining = state.character.skills[skill].training;
      var newTraining = null;

      switch (currentTraining) {
        case Constants.TRAINING.UNUSABLE:
          newTraining = Constants.TRAINING.TRAINED;
          break;
        case Constants.TRAINING.UNTRAINED:
          newTraining = Constants.TRAINING.TRAINED;
          break;
        case Constants.TRAINING.TRAINED:
          newTraining = Constants.TRAINING.SPECIALIZED;
          break;
        default:
          return;
      }

      state.character.skills[skill].training = newTraining;
    },

    decreaseTraining(state, skill) {
      const currentTraining = state.character.skills[skill].training;
      var newTraining = null;

      switch (currentTraining) {
        case Constants.TRAINING.SPECIALIZED:
          newTraining = Constants.TRAINING.TRAINED;
          
          // Reduce max skill invested to 208 (max for trained) if over
          if (state.character.skills[skill].invested > 208) {
            state.character.skills[skill].invested = 208;
          }

          break;
        case Constants.TRAINING.TRAINED:
          newTraining = Constants.UNTRAINED_STATE[skill];
          break;
        default:
          return;
      }

      state.character.skills[skill].training = newTraining;
    },

    changeAllInvestment(state, invested) {
      Constants.ATTRIBUTES.forEach(a => {
        let newval = Number(invested);
        newval = newval > 190 ? 190 : newval;

        state.character.attributes[a].invested = newval;
      });

      Constants.VITALS.forEach(a => {
        let newval = Number(invested);
        newval = newval > 196 ? 196 : newval;

        state.character.vitals[a].invested = newval;
      });
      
      Constants.SKILLS.forEach(skill => {
        let newval = Number(invested);

        if (state.character.skills[skill].training == Constants.TRAINING.TRAINED) {
          newval = newval > 208 ? 208 : newval;
        }

        state.character.skills[skill].invested = newval;
      });
    },

    changeAllAttributeInvestment(state, invested) {  
      Constants.ATTRIBUTES.forEach(a => {
        let newval = Number(invested);

        state.character.attributes[a].invested = newval;
      });
    },

    changeAllVitalInvestment(state, invested) {  
      Constants.VITALS.forEach(a => {
        let newval = Number(invested);

        state.character.vitals[a].invested = newval;
      });
    },

    changeAllSkillInvestment(state, invested) {
      Constants.SKILLS.forEach(skill => {
        let newval = Number(invested);

        if (state.character.skills[skill].training == Constants.TRAINING.TRAINED) {
          newval = newval > 208 ? 208 : newval;
        }

        state.character.skills[skill].invested = newval;
      });
    },

    changeAllBuffs(state, buff) {  
      Constants.ATTRIBUTES.forEach(attribute => {
        state.character.attributes[attribute].buff = Number(buff);
      });

      Constants.VITALS.forEach(vital => {
        state.character.vitals[vital].buff = Number(buff);
      });

      Constants.SKILLS.forEach(skill => {
        state.character.skills[skill].buff = Number(buff);
      });
    },

    changeAllAttributeBuffs(state, buff) {  
      Constants.ATTRIBUTES.forEach(attribute => {
        state.character.attributes[attribute].buff = Number(buff);
      });
    },

    changeAllVitalBuffs(state, buff) {  
      Constants.VITALS.forEach(vital => {
        state.character.vitals[vital].buff = Number(buff);
      });
    },

    changeAllSkillBuffs(state, buff) {
      Constants.SKILLS.forEach(skill => {
        state.character.skills[skill].buff = Number(buff);
      });
    },



    // Cantrips
    changeAllCantrips(state, cantrip) {  
      Constants.ATTRIBUTES.forEach(attribute => {
        state.character.attributes[attribute].cantrip = Number(cantrip);
      });

      Constants.VITALS.forEach(vital => {
        state.character.vitals[vital].cantrip = Number(cantrip);
      });

      Constants.SKILLS.forEach(skill => {
        state.character.skills[skill].cantrip = Number(cantrip);
      });
    },

    changeAllAttributeCantrips(state, cantrip) {  
      Constants.ATTRIBUTES.forEach(attribute => {
        state.character.attributes[attribute].cantrip = Number(cantrip);
      });
    },

    changeAllVitalCantrips(state, cantrip) {  
      Constants.VITALS.forEach(vital => {
        state.character.vitals[vital].cantrip = Number(cantrip);
      });
    },

    changeAllSkillCantrips(state, cantrip) {
      Constants.SKILLS.forEach(skill => {
        state.character.skills[skill].cantrip = Number(cantrip);
      });
    }
  }
});
