import Phaser from 'phaser';
import { computeWorldLayout } from '../systems/LayoutEngine';
import { findNearestInteractable, getInteractableById } from '../systems/InteractionDetector';
import { computeProgress } from '../systems/ProgressTracker';
import { updatePlayerPhysics } from '../systems/PlayerController';
import { resumeData } from '../data/resumeContent';
import { sectionConfigs } from '../data/sectionConfig';
import { eventBus } from '../events';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GROUND_Y,
  PLAYER_HEIGHT,
  CAMERA_DEAD_ZONE_WIDTH,
  CAMERA_DEAD_ZONE_HEIGHT,
  CAMERA_LERP,
} from '../constants';
import type { PlayerPhysicsState, InputState } from '../types/player';
import type { SectionType } from '../types/world';

import { Player } from '../objects/Player';
import { Interactable } from '../objects/Interactable';
import { InteractionPrompt } from '../objects/InteractionPrompt';
import { ParallaxBackground } from '../objects/ParallaxBackground';
import { Ground } from '../objects/Ground';
import { createDecorations } from '../objects/Decoration';
import { createSectionLabels, updateSectionLabelVisibility } from '../objects/SectionLabel';

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private playerState!: PlayerPhysicsState;
  private interactables: Interactable[] = [];
  private interactionPrompt!: InteractionPrompt;
  private parallax!: ParallaxBackground;
  private sectionLabels: Phaser.GameObjects.Text[] = [];

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private interactKey!: Phaser.Input.Keyboard.Key;

  private isPaused = false;
  private currentSection: SectionType = 'intro';
  private visitedInteractables = new Set<string>();

  // Mobile virtual input state
  private virtualInput: InputState = { left: false, right: false, jump: false, interact: false };

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    const layout = computeWorldLayout(resumeData, sectionConfigs);

    // World bounds
    this.cameras.main.setBounds(0, 0, layout.totalWidth, GAME_HEIGHT);

    // Background + ground
    this.parallax = new ParallaxBackground(this, layout.totalWidth);
    new Ground(this, layout.totalWidth, layout.sections);

    // Decorations
    createDecorations(this, layout.decorations);

    // Section labels
    this.sectionLabels = createSectionLabels(this, layout.sections);

    // Interactables
    for (const worldInt of layout.interactables) {
      const interactable = new Interactable(this, worldInt);
      this.interactables.push(interactable);
    }

    // Interaction prompt
    this.interactionPrompt = new InteractionPrompt(this);

    // Player
    this.playerState = {
      x: layout.spawnX,
      y: GROUND_Y - PLAYER_HEIGHT,
      velocityX: 0,
      velocityY: 0,
      isGrounded: true,
      facing: 'right',
    };
    this.player = new Player(this, this.playerState.x, this.playerState.y);

    // Camera
    this.cameras.main.startFollow(this.player, true, CAMERA_LERP, CAMERA_LERP);
    this.cameras.main.setDeadzone(CAMERA_DEAD_ZONE_WIDTH, CAMERA_DEAD_ZONE_HEIGHT);

    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    // Event listeners
    eventBus.on('modal:close', () => {
      this.isPaused = false;
    });
    eventBus.on('input:left', (data) => {
      this.virtualInput.left = data.active;
    });
    eventBus.on('input:right', (data) => {
      this.virtualInput.right = data.active;
    });
    eventBus.on('input:jump', () => {
      this.virtualInput.jump = true;
    });
    eventBus.on('input:interact', () => {
      this.virtualInput.interact = true;
    });

    // Store layout for use in update
    this.data.set('layout', layout);
  }

  update(_time: number, delta: number): void {
    if (this.isPaused) return;

    const layout = this.data.get('layout') as ReturnType<typeof computeWorldLayout>;
    const deltaSeconds = delta / 1000;

    // Gather input
    const input = this.gatherInput();

    // Update player physics
    this.playerState = updatePlayerPhysics(
      this.playerState,
      input,
      deltaSeconds,
      { minX: 16, maxX: layout.totalWidth - 16 }
    );
    this.player.updateFromState(this.playerState);

    // Check proximity
    const proximity = findNearestInteractable(this.playerState.x, layout.interactables);
    if (proximity.isInRange && proximity.interactableId) {
      const interactable = this.interactables.find(
        i => i.interactableId === proximity.interactableId
      );
      if (interactable) {
        this.interactionPrompt.show(interactable.x, interactable.y);
        interactable.setHighlighted(true);
      }

      // Handle interaction
      if (input.interact) {
        const worldInteractable = getInteractableById(
          proximity.interactableId,
          layout.interactables
        );
        if (worldInteractable) {
          this.isPaused = true;
          this.visitedInteractables.add(worldInteractable.id);
          const interactableObj = this.interactables.find(
            i => i.interactableId === worldInteractable.id
          );
          interactableObj?.setVisited(true);
          eventBus.emit('modal:open', {
            content: worldInteractable.modalContent,
            interactableId: worldInteractable.id,
          });
        }
      }
    } else {
      this.interactionPrompt.hide();
      for (const i of this.interactables) {
        i.setHighlighted(false);
      }
    }

    // Track progress
    const progress = computeProgress(this.playerState.x, layout.sections, layout.totalWidth);
    if (progress.currentSection !== this.currentSection) {
      this.currentSection = progress.currentSection;
      eventBus.emit('section:enter', {
        type: progress.currentSection,
        label: progress.currentLabel,
      });
    }
    eventBus.emit('player:move', {
      x: this.playerState.x,
      section: progress.currentSection,
    });

    // Update parallax
    this.parallax.update(this.cameras.main.scrollX);

    // Update section label visibility
    updateSectionLabelVisibility(
      this.sectionLabels,
      layout.sections,
      this.cameras.main.scrollX,
      GAME_WIDTH
    );

    // Clear one-shot inputs
    this.virtualInput.jump = false;
    this.virtualInput.interact = false;
  }

  private gatherInput(): InputState {
    const kb = this.input.keyboard;
    const left = (kb && (this.cursors?.left.isDown || this.wasd?.A.isDown)) || this.virtualInput.left;
    const right = (kb && (this.cursors?.right.isDown || this.wasd?.D.isDown)) || this.virtualInput.right;
    const jump = (kb && (this.cursors?.up.isDown || this.cursors?.space?.isDown || this.wasd?.W.isDown)) || this.virtualInput.jump;
    const interact = (kb && Phaser.Input.Keyboard.JustDown(this.interactKey)) || this.virtualInput.interact;

    return { left, right, jump, interact };
  }
}
